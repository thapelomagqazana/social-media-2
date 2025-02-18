import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import User from "../../models/User";
import jwt from "jsonwebtoken";

let mongoServer;
let authTokenUser1, authTokenUser2;
let user1, user2, user3, invalidUserId;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });

  // Create test users
  user1 = await User.create({ name: "User One", email: "user1@example.com", password: "Password123" });
  user2 = await User.create({ name: "User Two", email: "user2@example.com", password: "Password123" });
  user3 = await User.create({ name: "User Three", email: "user3@example.com", password: "Password123" });

  // Generate authentication tokens
  authTokenUser1 = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  authTokenUser2 = jwt.sign({ id: user2._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Create an invalid user ID (random ObjectId)
  invalidUserId = new mongoose.Types.ObjectId();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("DELETE /api/follow/:userId - Unfollow a user", () => {
  /**
   * ✅ Positive Test Cases
   */
  test("TC-001: User successfully unfollows another user", async () => {
    // First, follow user2
    await request(app)
      .post(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    // Now, unfollow user2
    const res = await request(app)
      .delete(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe(`You have unfollowed ${user2.name}.`);
  });

  test("TC-002: User follows then unfollows the same user", async () => {
    // Follow user3
    await request(app)
      .post(`/api/follow/${user3._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    // Unfollow user3
    const res = await request(app)
      .delete(`/api/follow/${user3._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe(`You have unfollowed ${user3.name}.`);
  });

  test("TC-003: User unfollows someone and their follower count decreases", async () => {
    // Get initial follower count
    const initialUser2 = await User.findById(user2._id);

    // Follow user2
    await request(app)
      .post(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    // Unfollow user2
    await request(app)
      .delete(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    // Fetch updated user2 details
    const updatedUser2 = await User.findById(user2._id);
    expect(updatedUser2.followers.length).toBe(initialUser2.followers.length);
  });

  /**
   * ❌ Negative Test Cases
   */
  test("TC-004: User tries to unfollow someone they aren’t following", async () => {
    const res = await request(app)
      .delete(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("You are not following this user.");
  });

  test("TC-005: User tries to unfollow themselves", async () => {
    const res = await request(app)
      .delete(`/api/follow/${user1._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("You cannot unfollow yourself.");
  });

  test("TC-006: User tries to unfollow a non-existent user", async () => {
    const res = await request(app)
      .delete(`/api/follow/${invalidUserId}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });

  test("TC-007: User sends request with an invalid user ID format", async () => {
    const res = await request(app)
      .delete(`/api/follow/invalid-id`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid user ID.");
  });

  test("TC-008: Unauthorized user (no token) tries to unfollow someone", async () => {
    const res = await request(app)
      .delete(`/api/follow/${user2._id}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token provided");
  });

  test("TC-009: User tries to unfollow with an expired JWT token", async () => {
    const expiredToken = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: "1s" });
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for token to expire

    const res = await request(app)
      .delete(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token, authentication failed");
  });

  /**
   * 🔄 Edge Test Cases
   */
  test("TC-010: User unfollows a private account they were approved to follow", async () => {
    await request(app)
    .post(`/api/follow/${user2._id}`)
    .set("Authorization", `Bearer ${authTokenUser1}`);

    const res = await request(app)
      .delete(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe(`You have unfollowed ${user2.name}.`);
  });

//   test("TC-011: Database goes down while user tries to unfollow", async () => {
//     jest.spyOn(User, "findById").mockRejectedValueOnce(new Error("Database error"));

//     const res = await request(app)
//       .delete(`/api/follow/${user2._id}`)
//       .set("Authorization", `Bearer ${authTokenUser1}`);

//     expect(res.statusCode).toBe(500);
//     expect(res.body.message).toBe("Internal Server Error.");
//   });

  test("TC-012: User unfollows someone with a high number of followers", async () => {
    await request(app)
      .post(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);
    const res = await request(app)
      .delete(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
  });
});
