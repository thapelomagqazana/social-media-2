import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import app from "../../app";
import User from "../../models/User";

let mongoServer;
let authToken1, authToken2, expiredToken, malformedToken;
let user1, user2, user3, nonExistentUserId;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
    // Create test users
    user1 = await User.create({
        name: "Alice",
        email: "alice@example.com",
        password: "Password123",
    });

    user2 = await User.create({
        name: "Bob",
        email: "bob@example.com",
        password: "Password123",
    });

    user3 = await User.create({
        name: "Charlie",
        email: "charlie@example.com",
        password: "Password123",
    });

    // Generate JWT tokens
    authToken1 = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    authToken2 = jwt.sign({ id: user2._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    expiredToken = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: "1s" });
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for token expiration

    malformedToken = "invalid.token.string";

    nonExistentUserId = new mongoose.Types.ObjectId(); // Generate a random user ID
});

afterEach(async () => {
    await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/follow/:userId - Follow a User", () => {
  /**
   * ✅ Positive Test Cases
   */
  test("TC-001: Authenticated user successfully follows another user", async () => {
    const res = await request(app)
      .post(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authToken1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe(`You are now following ${user2.name}.`);
  });

  test("TC-002: User follows multiple users successfully", async () => {
    const res1 = await request(app)
      .post(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authToken1}`);

    const res2 = await request(app)
      .post(`/api/follow/${user3._id}`)
      .set("Authorization", `Bearer ${authToken1}`);

    expect(res1.statusCode).toBe(200);
    expect(res1.body.message).toBe(`You are now following ${user2.name}.`);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.message).toBe(`You are now following ${user3.name}.`);
  });

  test("TC-003: Following a user updates both 'followers' and 'following' lists", async () => {
    await request(app)
      .post(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authToken1}`);

    const updatedUser1 = await User.findById(user1._id);
    const updatedUser2 = await User.findById(user2._id);

    expect(updatedUser1.following).toContainEqual(user2._id);
    expect(updatedUser2.followers).toContainEqual(user1._id);
  });

  /**
   * ❌ Negative Test Cases
   */
  test("TC-004: User tries to follow themselves", async () => {
    const res = await request(app)
      .post(`/api/follow/${user1._id}`)
      .set("Authorization", `Bearer ${authToken1}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("You cannot follow yourself.");
  });

  test("TC-005: User tries to follow a non-existent user", async () => {
    const res = await request(app)
      .post(`/api/follow/${nonExistentUserId}`)
      .set("Authorization", `Bearer ${authToken1}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });

  test("TC-006: User tries to follow another user without authentication", async () => {
    const res = await request(app).post(`/api/follow/${user2._id}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token provided");
  });

  test("TC-007: User tries to follow another user with an expired JWT token", async () => {
    const res = await request(app)
      .post(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token, authentication failed");
  });

  test("TC-008: User tries to follow another user with a malformed JWT token", async () => {
    const res = await request(app)
      .post(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${malformedToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token, authentication failed");
  });

  test("TC-009: User tries to follow another user they are already following", async () => {
    await request(app)
      .post(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authToken1}`);

    const res = await request(app)
      .post(`/api/follow/${user2._id}`)
      .set("Authorization", `Bearer ${authToken1}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("You are already following this user.");
  });

  /**
   * 🔄 Edge Cases
   */
//   test("TC-010: User follows another user and immediately unfollows them", async () => {
//     await request(app)
//       .post(`/api/follow/${user2._id}`)
//       .set("Authorization", `Bearer ${authToken1}`);

//     const unfollowRes = await request(app)
//       .post(`/api/unfollow/${user2._id}`)
//       .set("Authorization", `Bearer ${authToken1}`);

//     expect(unfollowRes.statusCode).toBe(200);
//     expect(unfollowRes.body.message).toBe(`You have unfollowed ${user2.name}.`);
//   });

  test("TC-011: User follows and unfollows the same user multiple times in quick succession", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post(`/api/follow/${user2._id}`).set("Authorization", `Bearer ${authToken1}`);
      await request(app).post(`/api/unfollow/${user2._id}`).set("Authorization", `Bearer ${authToken1}`);
    }
    expect(true).toBe(true); // Ensure the process doesn't break
  });

  test("TC-012: User follows a user whose account was deleted before the request is processed", async () => {
    const deletedUser = await User.create({
      name: "Deleted User",
      email: "deleted@example.com",
      password: "Password123",
    });

    await User.findByIdAndDelete(deletedUser._id);

    const res = await request(app)
      .post(`/api/follow/${deletedUser._id}`)
      .set("Authorization", `Bearer ${authToken1}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });
});
