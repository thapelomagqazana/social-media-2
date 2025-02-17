import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app"; // Import Express server
import User from "../../models/User"; // Import User Model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

let mongoServer;
let authToken;
let testUser;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });

  // Create test user
  testUser = await User.create({
    name: "John Doe",
    email: "john.doe@example.com",
    password: "StrongP@ssword123",
    bio: "Hello, I am a test user.",
  });

  // Generate authentication token
  authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("PUT /api/users/:userId - Update User Profile", () => {
  /**
   * ✅ Positive Test Cases
   */
  test("TC-001: User updates profile name and bio", async () => {
    const res = await request(app)
      .put(`/api/users/${testUser._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Updated Name", bio: "Updated Bio" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("Updated Name");
    expect(res.body.user.bio).toBe("Updated Bio");
  });

  test("TC-002: User updates email", async () => {
    const res = await request(app)
      .put(`/api/users/${testUser._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ email: "new.email@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("new.email@example.com");
  });

  test("TC-050: User updates displayName", async () => {
    const res = await request(app)
      .put(`/api/users/${testUser._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ displayName: "@testuser" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.displayName).toBe("@testuser");
  });

  test("TC-003: User updates password with a strong password", async () => {
    const res = await request(app)
      .put(`/api/users/${testUser._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ password: "NewStr0ng@Pass" });

    expect(res.statusCode).toBe(200);
    const updatedUser = await User.findById(testUser._id);
    const isMatch = await bcrypt.compare("NewStr0ng@Pass", updatedUser.password);
    expect(isMatch).toBeTruthy();
  });

  test("TC-004: User updates profile picture (valid JPG/PNG)", async () => {
    const res = await request(app)
      .put(`/api/users/${testUser._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .attach("profilePicture", "tests/files/test-image.jpg");

    expect(res.statusCode).toBe(200);
    expect(res.body.user.profilePicture).toMatch(/uploads\/\d+-test-image.jpg/);
  });

  /**
   * ❌ Negative Test Cases
   */
  test("TC-008: User tries updating another user's profile", async () => {
    const res = await request(app)
      .put(`/api/users/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Hacker Update" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Unauthorized to update this profile.");
  });

  test("TC-009: User updates email with an invalid format", async () => {
    const res = await request(app)
      .put(`/api/users/${testUser._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ email: "invalid-email" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid email format.");
  });

  test("TC-010: User updates password with less than 8 characters", async () => {
    const res = await request(app)
      .put(`/api/users/${testUser._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ password: "short" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Password must be at least 8 characters long.");
  });

  // test("TC-011: User updates profile picture with a non-image file (PDF)", async () => {
  //   const res = await request(app)
  //     .put(`/api/users/${testUser._id}`)
  //     .set("Authorization", `Bearer ${authToken}`)
  //     .attach("profilePicture", "tests/files/test-document.pdf");
  
  //   console.log(res.body);
  //   expect(res.statusCode).toBe(400);
  //   expect(res.body.message).toBe("Invalid file type. Only JPG and PNG are allowed.");
  // });
  

  test("TC-014: User updates profile without authentication token", async () => {
    const res = await request(app).put(`/api/users/${testUser._id}`).send({ name: "No Token Update" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token provided");
  });

  test("TC-015: User updates profile with an expired JWT token", async () => {
    const expiredToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: "1s" });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const res = await request(app)
      .put(`/api/users/${testUser._id}`)
      .set("Authorization", `Bearer ${expiredToken}`)
      .send({ name: "Expired Token Update" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token, authentication failed");
  });

  /**
   * 🔄 Edge Test Cases
   */
  test("TC-018: User updates email with leading/trailing spaces", async () => {
    const res = await request(app)
      .put(`/api/users/${testUser._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ email: "  spaced.email@example.com  " });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("spaced.email@example.com");
  });

  // test("TC-021: User uploads a profile picture larger than 5MB", async () => {
  //   const res = await request(app)
  //     .put(`/api/users/${testUser._id}`)
  //     .set("Authorization", `Bearer ${authToken}`)
  //     .attach("profilePicture", "tests/files/large-image.jpg");

  //   expect(res.statusCode).toBe(400);
  //   expect(res.body.message).toBe("File too large.");
  // });

  // test("TC-023: User updates profile while the server is experiencing database issues", async () => {
  //   jest.spyOn(User, "findById").mockRejectedValueOnce(new Error("Database error"));

  //   const res = await request(app)
  //     .put(`/api/users/${testUser._id}`)
  //     .set("Authorization", `Bearer ${authToken}`)
  //     .send({ name: "Database Failure Test" });

  //   expect(res.statusCode).toBe(500);
  //   expect(res.body.message).toBe("Internal Server Error.");
  // });
});
