import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app"; // Import Express server
import User from "../../models/User"; // Import User Model
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
    { name: "Alice", email: "alice@example.com", password: "password123", role: "user", active: true },
    { name: "Bob", email: "bob@example.com", password: "password123", role: "admin", active: false },
    { name: "Charlie", email: "charlie@example.com", password: "password123", role: "user", active: true },
  ]);

  // Generate authentication tokens
  authToken = jwt.sign({ id: testUsers[0]._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  adminToken = jwt.sign({ id: testUsers[1]._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/users - Retrieve All Users", () => {
  /**
   * ✅ Positive Test Cases
   */
  test("TC-001: Users exist in the database", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  test("TC-002: Request with authentication token", async () => {
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  test("TC-003: Request without query parameters", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.users)).toBeTruthy();
  });

  test("TC-004: Request with pagination (page=1&limit=10)", async () => {
    const res = await request(app).get("/api/users?page=1&limit=10");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeLessThanOrEqual(10);
  });

  test("TC-005: Request with sorting (sort=name)", async () => {
    const res = await request(app).get("/api/users?sort=name");
    expect(res.statusCode).toBe(200);
    expect(res.body.users[0].name).toBe("Alice");
  });

  test("TC-006: Request with filtering (role=admin)", async () => {
    const res = await request(app).get("/api/users?role=admin");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].role).toBe("admin");
  });

  test("TC-007: Request for a single page when total users are less than the limit", async () => {
    const res = await request(app).get("/api/users?page=1&limit=10");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(3);
  });

  test("TC-008: Request for active users (active=true)", async () => {
    const res = await request(app).get("/api/users?active=true");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.every(user => user.active)).toBeTruthy();
  });

  /**
   * ❌ Negative Test Cases
   */
  test("TC-009: No users in the database", async () => {
    await User.deleteMany({});
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No users found");
  });

  // test("TC-012: API call without authentication token", async () => {
  //   const res = await request(app).get("/api/users");
  //   expect(res.statusCode).toBe(200); // Adjust based on auth requirement
  // });

  test("TC-014: API call to an invalid URL", async () => {
    const res = await request(app).get("/api/userlist");
    expect(res.statusCode).toBe(404);
  });

  /**
   * 🔄 Edge Test Cases
   */
  test("TC-018: Database contains exactly one user", async () => {
    await User.create({ name: "SingleUser", email: "single@example.com", password: "password123" });
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(1);
  });

  // test("TC-019: Database contains 1000+ users", async () => {
  //   const bulkUsers = Array.from({ length: 1000 }, (_, i) => ({
  //     name: `User${i}`,
  //     email: `user${i}@example.com`,
  //     password: "password123",
  //   }));
  //   await User.insertMany(bulkUsers);
  //   const res = await request(app).get("/api/users");
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.users.length).toBeGreaterThan(1000);
  // });

  test("TC-021: Request with `Accept: application/xml` header", async () => {
    const res = await request(app).get("/api/users").set("Accept", "application/xml");
    expect(res.statusCode).toBe(406);
  });

  test("TC-022: User emails contain special characters", async () => {
    await User.create({ name: "Test", email: "user+test@example.com", password: "password123" });
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.users.some(user => user.email.includes("+"))).toBeTruthy();
  });

  // test("TC-025: API rate limiting enforcement", async () => {
  //   for (let i = 0; i < 50; i++) {
  //     await request(app).get("/api/users");
  //   }
  //   const res = await request(app).get("/api/users");
  //   expect(res.statusCode).toBe(429);
  // });
});
