import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();

// Dummy users and tokens
let adminToken, userToken, expiredToken, invalidUserId, validUserId, adminId, nonExistentUserId;

let mongoServer;

/**
 * @beforeAll - Connect to the test database before running tests
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Clear users collection
  await User.deleteMany({});

  // Create test users
  const adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "AdminPass@123",
  });

  const regularUser = await User.create({
    name: "Regular User",
    email: "user@example.com",
    password: "UserPass@123",
  });

  // Assign valid user ID
  validUserId = regularUser._id.toString();
  adminId = adminUser._id.toString();
  nonExistentUserId = "615b9cfa5a0f1a001cbb96ab"; // Random valid ObjectID format

  // Generate JWT tokens
  adminToken = jwt.sign({ id: adminUser._id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  userToken = jwt.sign({ id: regularUser._id, role: "user" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  expiredToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET, {
    expiresIn: "-1h",
  });

  invalidUserId = "invalid1234";
});

/**
 * @afterAll - Disconnect from the test database after tests
 */
afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("PUT /api/users/:userId - Update User", () => {
  
  // ✅ Positive Test Cases
  test("TC-001: User updates name and bio successfully", async () => {
    const res = await request(app)
      .put(`/api/users/${validUserId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "John Updated", bio: "Updated Bio" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully");
    expect(res.body.user.name).toBe("John Updated");
    expect(res.body.user.bio).toBe("Updated Bio");
  });

  test("TC-002: User updates only the name", async () => {
    const res = await request(app)
      .put(`/api/users/${validUserId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "New Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("New Name");
  });

  test("TC-003: User updates only the bio", async () => {
    const res = await request(app)
      .put(`/api/users/${validUserId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ bio: "New bio text" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.bio).toBe("New bio text");
  });

  test("TC-004: User updates the profile picture", async () => {
    const res = await request(app)
      .put(`/api/users/${validUserId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ profilePicture: "https://example.com/new-profile.jpg" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.profilePicture).toBe("https://example.com/new-profile.jpg");
  });

  test("TC-005: User updates all fields at once", async () => {
    const res = await request(app)
      .put(`/api/users/${validUserId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Updated Full",
        bio: "New Bio",
        profilePicture: "https://example.com/profile-updated.jpg",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("Updated Full");
    expect(res.body.user.bio).toBe("New Bio");
    expect(res.body.user.profilePicture).toBe("https://example.com/profile-updated.jpg");
  });

  test("TC-006: User uploads a valid profile picture (JPG/PNG within 5MB)", async () => {
    const res = await request(app)
      .put(`/api/users/${validUserId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ profilePicture: "https://example.com/new-image.png" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully");
  });

//   // ❌ **Negative Test Cases**
//   it("❌ Should fail when no authorization token is provided", async () => {
//     const response = await request(app).put(`/api/users/${validUserId}`).send({ name: "No Auth" });

//     expect(response.status).toBe(401);
//     expect(response.body).toHaveProperty("message", "Not authorized, no token provided");
//   });

//   it("❌ Should fail when using an invalid authorization token", async () => {
//     const response = await request(app)
//       .put(`/api/users/${validUserId}`)
//       .set("Authorization", `Bearer invalidToken123`)
//       .send({ name: "Invalid Token" });

//     expect(response.status).toBe(401);
//     expect(response.body).toHaveProperty("message", "Invalid token, authentication failed");
//   });

//   it("❌ Should fail when using an expired token", async () => {
//     const response = await request(app)
//       .put(`/api/users/${validUserId}`)
//       .set("Authorization", `Bearer ${expiredToken}`)
//       .send({ name: "Expired Token" });

//     expect(response.status).toBe(401);
//     expect(response.body).toHaveProperty("message", "Invalid token, authentication failed");
//   });

// //   it("❌ Should fail when a non-admin tries to update another user", async () => {
// //     const response = await request(app)
// //       .put(`/api/users/${adminId}`)
// //       .set("Authorization", `Bearer ${userToken}`)
// //       .send({ name: "Unauthorized Update" });

// //     expect(response.status).toBe(403);
// //     expect(response.body).toHaveProperty("message", "Access denied");
// //   });

//   it("❌ Should fail when user ID is not found", async () => {
//     const response = await request(app)
//       .put(`/api/users/${nonExistentUserId}`)
//       .set("Authorization", `Bearer ${adminToken}`)
//       .send({ name: "Not Found" });

//     expect(response.status).toBe(404);
//     expect(response.body).toHaveProperty("message", "User not found");
//   });

//   it("❌ Should fail when trying to update restricted fields", async () => {
//     const response = await request(app)
//       .put(`/api/users/${validUserId}`)
//       .set("Authorization", `Bearer ${adminToken}`)
//       .send({ password: "NewPassword123" });

//     expect(response.status).toBe(400);
//     expect(response.body).toHaveProperty("message", "Password update not allowed");
//   });

//   // 🔹 **Edge Cases**
//   it("🔹 Should allow update with extra unrelated fields (ignored)", async () => {
//     const response = await request(app)
//       .put(`/api/users/${validUserId}`)
//       .set("Authorization", `Bearer ${adminToken}`)
//       .send({ name: "Updated", extraField: "Random" });

//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty("message", "User updated successfully");
//   });

//   it("🔹 Should reject an extremely long name", async () => {
//     const response = await request(app)
//       .put(`/api/users/${validUserId}`)
//       .set("Authorization", `Bearer ${adminToken}`)
//       .send({ name: "A".repeat(300) });

//     expect(response.status).toBe(400);
//     expect(response.body).toHaveProperty("message", "Validation failed: name: Name must be at most 255 characters long");
//   });

//   // 🛑 **Corner Cases**
//   it("🛑 Should fail when user ID is empty", async () => {
//     const response = await request(app)
//       .put("/api/users/")
//       .set("Authorization", `Bearer ${adminToken}`)
//       .send({ name: "Empty ID" });

//     expect(response.status).toBe(404);
//   });

//   it("🛑 Should fail when user ID is a boolean", async () => {
//     const response = await request(app)
//       .put("/api/users/true")
//       .set("Authorization", `Bearer ${adminToken}`)
//       .send({ name: "Boolean ID" });

//     expect(response.status).toBe(400);
//     expect(response.body).toHaveProperty("message", "Invalid user ID");
//   });
});
