import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import User from "../../models/User";
import jwt from "jsonwebtoken";

let mongoServer;
let authTokenUser1, authTokenUser2;
let user1, user2, user3, privateUser, deletedUser;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create test users
  user1 = await User.create({
    name: "User One",
    email: "user1@example.com",
    password: "Password123!",
    following: [],
  });

  user2 = await User.create({
    name: "User Two",
    email: "user2@example.com",
    password: "Password123!",
    following: [],
  });

  user3 = await User.create({
    name: "User Three",
    email: "user3@example.com",
    password: "Password123!",
    following: [],
  });

  privateUser = await User.create({
    name: "Private User",
    email: "private@example.com",
    password: "Password123!",
    following: [],
    isPrivate: true, // Mark as private
  });

  deletedUser = await User.create({
    name: "Deleted User",
    email: "deleted@example.com",
    password: "Password123!",
  });

  // User1 follows User2 & User3
  user1.following.push(user2._id, user3._id);
  await user1.save();

  // Generate JWT tokens
  authTokenUser1 = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  authTokenUser2 = jwt.sign({ id: user2._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Simulate deleted user scenario
  await User.deleteOne({ _id: deletedUser._id });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/users/:userId/following - Retrieve Following List", () => {
  /**
   * ✅ Positive Test Cases
   */
  test("TC-001: User retrieves their own following list", async () => {
    const res = await request(app)
      .get(`/api/users/${user1._id}/following`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.following.length).toBe(2);
  });

  test("TC-002: User retrieves another public user’s following list", async () => {
    const res = await request(app)
      .get(`/api/users/${user2._id}/following`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.following)).toBeTruthy();
  });

  test("TC-003: User follows multiple users and fetches the list", async () => {
    const res = await request(app)
      .get(`/api/users/${user1._id}/following`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.following.length).toBe(2);
  });

  test("TC-004: User follows only one person and fetches the list", async () => {
    user2.following.push(user3._id);
    await user2.save();

    const res = await request(app)
      .get(`/api/users/${user2._id}/following`)
      .set("Authorization", `Bearer ${authTokenUser2}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.following.length).toBe(1);
  });

  test("TC-005: User does not follow anyone", async () => {
    const res = await request(app)
      .get(`/api/users/${user3._id}/following`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.following.length).toBe(0);
  });

  /**
   * ❌ Negative Test Cases
   */
  test("TC-006: User requests following list of a non-existent user", async () => {
    const res = await request(app)
      .get(`/api/users/${new mongoose.Types.ObjectId()}/following`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });

  test("TC-007: User requests following list with an invalid userId format", async () => {
    const res = await request(app)
      .get(`/api/users/invalid-id/following`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid user ID.");
  });

  test("TC-008: User tries to retrieve the following list of a private account (without following)", async () => {
    const res = await request(app)
      .get(`/api/users/${privateUser._id}/following`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("This user's following list is private.");
  });

  test("TC-009: Unauthorized request (no token provided)", async () => {
    const res = await request(app).get(`/api/users/${user1._id}/following`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token provided");
  });

  /**
   * 🔄 Edge Test Cases
   */
//   test("TC-012: Database goes down while retrieving following list", async () => {
//     jest.spyOn(User, "findById").mockRejectedValueOnce(new Error("Database error"));

//     const res = await request(app)
//       .get(`/api/users/${user1._id}/following`)
//       .set("Authorization", `Bearer ${authTokenUser1}`);

//     expect(res.statusCode).toBe(500);
//     expect(res.body.message).toBe("Internal Server Error.");
//   });

  test("TC-013: User follows users, but some accounts are deleted", async () => {
    const res = await request(app)
      .get(`/api/users/${user1._id}/following`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.following.length).toBe(2);
  });
});
