/**
 * @file signin.test.js
 * @description Tests for the POST /api/auth/signin endpoint.
 */

import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app"; // Your Express app
import User from "../../models/User";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany(); // Clear database before each test
});

// Helper function to create a test user
const createTestUser = async (email, password) => {
  const user = new User({ name: "Test User", email, password });
  await user.save();
};

describe("POST /api/auth/signin", () => {
  // ✅ Positive Test Cases
  test("TC-001: Should log in with valid email and password", async () => {
    await createTestUser("testuser@example.com", "SecurePass123");

    const res = await request(app).post("/api/auth/signin").send({
      email: "testuser@example.com",
      password: "SecurePass123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.message).toBe("Welcome back, Test User!");
  });

  test("TC-002: Should log in with 'Remember Me' checked and extend session", async () => {
    await createTestUser("remember@example.com", "SecurePass123");

    const res = await request(app).post("/api/auth/signin").send({
      email: "remember@example.com",
      password: "SecurePass123",
      rememberMe: true,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.tokenExpiration).toBe("7d"); // Should have extended expiration
  });

  test("TC-003: Should log in after successful signup", async () => {
    await createTestUser("newuser@example.com", "Password123");

    const res = await request(app).post("/api/auth/signin").send({
      email: "newuser@example.com",
      password: "Password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("TC-004: Should log in with email in uppercase (case-insensitive)", async () => {
    await createTestUser("case@example.com", "SecurePass123");

    const res = await request(app).post("/api/auth/signin").send({
      email: "CASE@EXAMPLE.COM",
      password: "SecurePass123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  // ❌ Negative Test Cases
  test("TC-005: Should return error for incorrect password", async () => {
    await createTestUser("wrongpass@example.com", "CorrectPass123");

    const res = await request(app).post("/api/auth/signin").send({
      email: "wrongpass@example.com",
      password: "WrongPass456",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Incorrect password. Try again.");
  });

  test("TC-006: Should return error for unregistered email", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      email: "unregistered@example.com",
      password: "SomePass123",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No account found with this email. Sign up instead?");
  });

  test("TC-007: Should return error when email is missing", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      password: "SecurePass123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Email is required");
  });

  test("TC-008: Should return error when password is missing", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      email: "test@example.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Password is required");
  });

  test("TC-009: Should return error for invalid email format", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      email: "invalid-email",
      password: "SecurePass123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Invalid email format");
  });

  // 🔄 Edge Cases
  test("TC-016: Should trim spaces around email and log in successfully", async () => {
    await createTestUser("trim@example.com", "SecurePass123");

    const res = await request(app).post("/api/auth/signin").send({
      email: "  trim@example.com  ",
      password: "SecurePass123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("TC-017: Should handle leading/trailing spaces and uppercase email", async () => {
    await createTestUser("case@example.com", "SecurePass123");

    const res = await request(app).post("/api/auth/signin").send({
      email: "  CASE@EXAMPLE.COM  ",
      password: "SecurePass123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("TC-020: Should prevent SQL injection attempts", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      email: "' OR '1'='1",
      password: "anyPassword",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Invalid email format");
  });

  test("TC-021: Should prevent script injection attacks", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      email: "<script>alert('Hacked')</script>",
      password: "anyPass",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Invalid email format");
  });

  test("TC-022: Should return error for an extremely long email", async () => {
    const longEmail = "a".repeat(310) + "@example.com";
    const res = await request(app).post("/api/auth/signin").send({
      email: longEmail,
      password: "SecurePass123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Invalid email length.");
  });
});
