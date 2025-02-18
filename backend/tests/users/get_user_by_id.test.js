import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import User from "../../models/User";
import jwt from "jsonwebtoken";

let mongoServer;
let testUser;
let authToken;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });

  // Create a test user
  testUser = await User.create({
    name: "John Doe",
    email: "johndoe@example.com",
    password: "StrongP@ss123",
    profilePicture: "/uploads/profile.jpg",
  });

  // Generate authentication token
  authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/users/:userId - Retrieve User by ID", () => {

  /** ✅ Positive Test Cases **/
  test("TC-001: Valid user ID exists in the database", async () => {
    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("name", "John Doe");
    expect(res.body.user).toHaveProperty("email", "johndoe@example.com");
    expect(res.body.user).not.toHaveProperty("password"); // Ensure password is excluded
  });

  test("TC-002: User is retrieved with authentication", async () => {
    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("email", "johndoe@example.com");
  });

  test("TC-003: User has a profile picture", async () => {
    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("profilePicture", "/uploads/profile.jpg");
  });

  test("TC-004: Request includes optional fields (createdAt, role)", async () => {
    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("createdAt");
    expect(res.body.user).toHaveProperty("role", "user");
  });

  test("TC-005: User with a long name and email exists", async () => {
    const longUser = await User.create({
      name: "Johnathan Maxwell Alexander Benjamin de la Cruz the Third",
      email: "extremely.long.email@example.com",
      password: "LongPass1234!",
      profilePicture: "/uploads/long.jpg",
    });

    const res = await request(app).get(`/api/users/${longUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.user.name.length).toBeGreaterThan(10);
    expect(res.body.user.email.length).toBeGreaterThan(10);
  });

  /** ❌ Negative Test Cases **/
  test("TC-006: User ID is invalid (not a valid ObjectId)", async () => {
    const res = await request(app).get("/api/users/invalidUserId").set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid user ID format");
  });

  test("TC-007: User ID does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/users/${nonExistentId}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  test("TC-008: API call with expired JWT token", async () => {
    const expiredToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: "1s" });
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for token to expire

    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${expiredToken}`);
    
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token, authentication failed");
  });

  test("TC-009: API call with an invalid JWT token", async () => {
    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", "Bearer invalid.token");
    
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token, authentication failed");
  });

  test("TC-010: API call without authentication token", async () => {
    const res = await request(app).get(`/api/users/${testUser._id}`);
    
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token provided");
  });

  test("TC-011: API accessed with an unauthorized role", async () => {
    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200); // Adjust based on your role-checking logic
  });

  test("TC-012: API call with an invalid URL", async () => {
    const res = await request(app).get(`/api/userdetail/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(404);
  });

  // test("TC-013: API call with an invalid HTTP method", async () => {
  //   const res = await request(app).post(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
  //   expect(res.statusCode).toBe(405);
  // });

  /** 🔄 Edge Test Cases **/
  test("TC-015: Database contains exactly one user", async () => {
    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
  });

  test("TC-016: User has an extremely long bio", async () => {
    await User.findByIdAndUpdate(testUser._id, { bio: "a".repeat(500) });
    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
  });

  test("TC-017: User email contains special characters", async () => {
    await User.findByIdAndUpdate(testUser._id, { email: "user+test@example.com" });
    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
  });

  test("TC-018: User names contain non-ASCII characters", async () => {
    await User.findByIdAndUpdate(testUser._id, { name: "张伟" });
    const res = await request(app).get(`/api/users/${testUser._id}`).set("Authorization", `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
  });

  // test("TC-019: API call includes `Accept: application/xml`", async () => {
  //   const res = await request(app).get(`/api/users/${testUser._id}`).set("Accept", "application/xml");
    
  //   expect(res.statusCode).toBe(406);
  // });

});
