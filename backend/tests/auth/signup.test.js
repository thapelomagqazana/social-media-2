import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../app";
import User from "../../models/User";
import { response } from "express";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("POST /api/auth/signup", () => {
  beforeEach(async () => {
    await User.deleteMany(); // Clear database before each test
  });

  // ✅ POSITIVE TEST CASES
  test("✅ Should register a user with valid details", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "StrongPass123!",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully.");

    // Verify user exists in database
    const user = await User.findOne({ email: "johndoe@example.com" });
    expect(user).toBeDefined();
    expect(user.email).toBe("johndoe@example.com");
  });

  test("✅ Should handle email with capital letters", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Jane Doe",
      email: "JANEDOE@EXAMPLE.COM",
      password: "Passw0rd!",
    });

    expect(res.statusCode).toBe(201);

    // Ensure email is stored in lowercase
    const user = await User.findOne({ email: "janedoe@example.com" });
    expect(user).toBeDefined();
    expect(user.email).toBe("janedoe@example.com");
  });

  test("✅ Should accept long valid name (50 chars)", async () => {
    const longName = "A".repeat(50);
    const res = await request(app).post("/api/auth/signup").send({
      name: longName,
      email: "longname@example.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toContain("User registered successfully");

    // Verify in DB
    const user = await User.findOne({ email: "longname@example.com" });
    expect(user.name.length).toBe(50);
  });

  // ❌ NEGATIVE TEST CASES
  test("❌ Should return error when name is missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "missingname@example.com",
      password: "ValidPassword1!",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Name is required");
  });

  test("❌ Should return error when email is missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Missing Email",
      password: "ValidPassword1!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Email is required");
  });

  test("❌ Should return error when password is missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Missing Password",
      email: "missingpassword@example.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Password is required");
  });

  test("❌ Should return error when email format is invalid", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Invalid Email",
      email: "invalidemail",
      password: "ValidPassword1!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Invalid email format");
  });

  test("❌ Should return error when password is too short", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Short Password",
      email: "shortpassword@example.com",
      password: "12345",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Password must be at least 8 characters long");
  });

  test("❌ Should return error when email is already registered", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Existing User",
      email: "duplicate@example.com",
      password: "ValidPassword1!",
    });

    const res = await request(app).post("/api/auth/signup").send({
      name: "Duplicate User",
      email: "duplicate@example.com",
      password: "ValidPassword1!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email already registered");
  });

  // ⚠️ EDGE CASES
  test("⚠️ Should return error when name is too long (255+ chars)", async () => {
    const longName = "A".repeat(256);
    const res = await request(app).post("/api/auth/signup").send({
      name: longName,
      email: "longname@example.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Name is too long. Max 255 characters allowed.");
  });

  test("⚠️ Should trim and process email with leading/trailing spaces", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Trimmed Email",
      email: "  trim@example.com  ",
      password: "ValidPassword1!",
    });

    expect(res.statusCode).toBe(201);

    // Ensure email is stored correctly
    const user = await User.findOne({ email: "trim@example.com" });
    expect(user).toBeDefined();
    expect(user.email).toBe("trim@example.com");
  });

  test("⚠️ Should return error when password contains only spaces", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Blank Password",
      email: "blankpassword@example.com",
      password: "     ",
    });

    expect(res.statusCode).toBe(400);
  });

  // test("⚠️ Should handle Unicode characters in name", async () => {
  //   const res = await request(app).post("/api/auth/signup").send({
  //     name: "ジョン・ドー",
  //     email: "unicode@example.com",
  //     password: "StrongPass123!",
  //   });

  //   expect(res.statusCode).toBe(201);
  // });

  test("⚠️ Should return error for SQL injection in email", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "SQL Injection",
      email: "' OR '1'='1",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Invalid email format");
  });

  test("⚠️ Should return error for XSS attack attempt in name", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "<script>alert('Hacked!')</script>",
      email: "xss@example.com",
      password: "StrongPass123!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid name format. Name can contain letters, numbers, and spaces.");
  });
});