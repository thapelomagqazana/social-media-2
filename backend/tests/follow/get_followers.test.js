import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app"; // Import Express app
import User from "../../models/User";
import jwt from "jsonwebtoken";

let mongoServer;
let authTokenUser1, authTokenUser2;
let user1, user2, user3;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create test users
  user1 = await User.create({
    name: "John Doe",
    email: "john.doe@example.com",
    password: "Password123!",
    profilePicture: "profile1.jpg",
  });

  user2 = await User.create({
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "Password123!",
    profilePicture: "profile2.jpg",
  });

  user3 = await User.create({
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    password: "Password123!",
    profilePicture: "profile3.jpg",
  });

  // User2 & User3 follow User1
  user1.followers.push(user2._id, user3._id);
  await user1.save();

  // Generate authentication tokens
  authTokenUser1 = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  authTokenUser2 = jwt.sign({ id: user2._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/followers/:userId - Retrieve Followers List", () => {
  /**
   * ✅ Positive Test Cases
   */
  test("TC-001: User retrieves their own list of followers", async () => {
    const res = await request(app)
      .get(`/api/users/${user1._id}/followers`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.followers).toHaveLength(2);
    expect(res.body.followers[0]).toHaveProperty("name");
    expect(res.body.followers[0]).toHaveProperty("profilePicture");
  });

  test("TC-002: User retrieves another public user’s followers", async () => {
    const res = await request(app)
      .get(`/api/users/${user1._id}/followers`)
      .set("Authorization", `Bearer ${authTokenUser2}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.followers).toHaveLength(2);
  });

  test("TC-003: User with multiple followers fetches the list", async () => {
    const res = await request(app)
      .get(`/api/users/${user1._id}/followers`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.followers.length).toBeGreaterThan(1);
  });

  test("TC-004: User with exactly one follower fetches the list", async () => {
    const user4 = await User.create({
      name: "Lisa Ray",
      email: "lisa.ray@example.com",
      password: "Password123!",
      profilePicture: "profile4.jpg",
      followers: [user1._id],
    });

    const res = await request(app)
      .get(`/api/users/${user4._id}/followers`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.followers).toHaveLength(1);
  });

  test("TC-005: User without any followers fetches the list", async () => {
    const user5 = await User.create({
      name: "No Followers",
      email: "nofollowers@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .get(`/api/users/${user5._id}/followers`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.followers).toEqual([]);
  });

  /**
   * ❌ Negative Test Cases
   */
  test("TC-006: User requests followers of a non-existent user", async () => {
    const res = await request(app)
      .get(`/api/users/${new mongoose.Types.ObjectId()}/followers`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });

  test("TC-007: User requests followers with an invalid userId format", async () => {
    const res = await request(app)
      .get(`/api/users/invalid-id/followers`)
      .set("Authorization", `Bearer ${authTokenUser1}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid user ID.");
  });

  test("TC-008: User tries to retrieve followers of a private account (without following)", async () => {
    const privateUser = await User.create({
      name: "Private User",
      email: "private@example.com",
      password: "Password123!",
      followers: [],
      isPrivate: true,
    });

    const res = await request(app)
      .get(`/api/users/${privateUser._id}/followers`)
      .set("Authorization", `Bearer ${authTokenUser2}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("This user's followers list is private.");
  });

  test("TC-009: Unauthorized request (no token provided)", async () => {
    const res = await request(app)
      .get(`/api/users/${user1._id}/followers`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token provided");
  });

  test("TC-010: User provides an expired or invalid JWT token", async () => {
    const expiredToken = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: "1s" });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const res = await request(app)
      .get(`/api/users/${user1._id}/followers`)
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token, authentication failed");
  });

  /**
   * 🔄 Edge Test Cases
   */
//   test("TC-011: User has exactly 1000 followers (pagination case)", async () => {
//     const bulkFollowers = [];
//     for (let i = 0; i < 1000; i++) {
//       const user = await User.create({
//         name: `Follower ${i}`,
//         email: `follower${i}@example.com`,
//         password: "Password123!",
//       });
//       bulkFollowers.push(user._id);
//     }

//     user1.followers = bulkFollowers;
//     await user1.save();

//     const res = await request(app)
//       .get(`/api/users/${user1._id}/followers`)
//       .set("Authorization", `Bearer ${authTokenUser1}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.followers.length).toBeGreaterThanOrEqual(1000);
//   });

//   test("TC-012: Database goes down while retrieving followers", async () => {
//     jest.spyOn(User, "findById").mockRejectedValueOnce(new Error("Database error"));

//     const res = await request(app)
//       .get(`/api/users/${user1._id}/followers`)
//       .set("Authorization", `Bearer ${authTokenUser1}`);

//     expect(res.statusCode).toBe(500);
//     expect(res.body.message).toBe("Internal Server Error.");
//   });
});
