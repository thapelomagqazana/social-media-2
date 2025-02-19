import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import User from "../../models/User";
import jwt from "jsonwebtoken";

let mongoServer;
let authToken;
let adminToken;
let testUsers = [];

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });

  // Create test users
  testUsers = await User.insertMany([
    { name: "Alice Johnson", email: "alice@example.com", displayName: "alicej", password: "password123", role: "user", active: true },
    { name: "Bob Williams", email: "bob@example.com", displayName: "bobby", password: "password123", role: "admin", active: false },
    { name: "Charlie Smith", email: "charlie@example.com", displayName: "charlies", password: "password123", role: "user", active: true },
    { name: "David Brown", email: "david@example.com", displayName: "davey", password: "password123", role: "user", active: true },
  ]);

  // Generate authentication tokens
  authToken = jwt.sign({ id: testUsers[0]._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  adminToken = jwt.sign({ id: testUsers[1]._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/users?search - Retrieve Users with a specific search query", () => {
  /**
   * 🔍 Search Test Cases
   */
  test("TC-010: Search users by name", async () => {
    const res = await request(app).get("/api/users?search=Alice");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].name).toBe("Alice Johnson");
  });

  test("TC-011: Search users by email", async () => {
    const res = await request(app).get("/api/users?search=charlie@example.com");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].email).toBe("charlie@example.com");
  });

  test("TC-012: Search users by displayName", async () => {
    const res = await request(app).get("/api/users?search=davey");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].displayName).toBe("davey");
  });

  test("TC-013: Case-insensitive search", async () => {
    const res = await request(app).get("/api/users?search=alice");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].name).toBe("Alice Johnson");
  });

  test("TC-014: Search users with special characters", async () => {
    await User.create({ name: "Eve O'Reilly", email: "eve@example.com", password: "password123" });
    const res = await request(app).get("/api/users?search=O'Reilly");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].name).toBe("Eve O'Reilly");
  });

  test("TC-015: Search with no matching users", async () => {
    const res = await request(app).get("/api/users?search=unknownuser");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No users found");
  });

  /**
   * ❌ Negative Test Cases
   */
  test("TC-016: Search query with invalid characters", async () => {
    const res = await request(app).get("/api/users?search=<script>alert('XSS')</script>");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid input");
  });

  test("TC-017: SQL Injection attempt in search query", async () => {
    const res = await request(app).get("/api/users?search=' OR 1=1 --");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid search query.");
  });

  /**
   * 🔄 Edge Test Cases
   */
  test("TC-018: Search with only spaces", async () => {
    const res = await request(app).get("/api/users?search=   ");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid search query.");
  });

  test("TC-019: Search query that matches multiple users", async () => {
    const res = await request(app).get("/api/users?search=example.com");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(1);
  });
});
