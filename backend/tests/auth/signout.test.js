import request from "supertest";
import app from "../../app"; // Import your Express server instance
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../../models/User"; // Import the User model
import mongoose from "mongoose";

// Mock JWT Secret for tests
const JWT_SECRET = process.env.JWT_SECRET || "test_secret";

let mongoServer;

// Utility function to generate JWT tokens
const generateToken = (userId, expiresIn = "1h") => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn });
};

describe("POST /api/auth/signout - Logout API", () => {
  let user;
  let validToken, expiredToken, revokedToken, malformedToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create a test user
    user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "TestPass123!",
    });

    // Generate tokens
    validToken = generateToken(user._id);
    expiredToken = generateToken(user._id, "-1s"); // Expired token
    revokedToken = generateToken(user._id); // This will be manually revoked in a test
    malformedToken = "invalid.token.string"; // Malformed token
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // ✅ Positive Test Cases
  test("TC-001: User logs out successfully with a valid token", async () => {
    const res = await request(app)
      .get("/api/auth/signout")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User signed out successfully");
  });

  // test("TC-002: User logs out while using a valid token stored in cookies", async () => {
  //   const freshToken = generateToken(user._id);
  //   const res = await request(app)
  //     .get("/api/auth/signout")
  //     .set("Cookie", `jwt=${freshToken}`);

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.message).toBe("User signed out successfully");
  // });

  test("TC-003: User logs out after being authenticated with a recently refreshed token", async () => {
    const freshToken = generateToken(user._id);
    const res = await request(app)
      .get("/api/auth/signout")
      .set("Authorization", `Bearer ${freshToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User signed out successfully");
  });

  test("TC-004: User logs out from multiple devices (each session invalidates separately)", async () => {
    const token1 = generateToken(user._id);
    const token2 = generateToken(user._id);

    // Logout first session
    const res1 = await request(app)
      .get("/api/auth/signout")
      .set("Authorization", `Bearer ${token1}`);

    expect(res1.statusCode).toBe(200);

    // Logout second session
    const res2 = await request(app)
      .get("/api/auth/signout")
      .set("Authorization", `Bearer ${token2}`);

    expect(res2.statusCode).toBe(200);
  });

  // ❌ Negative Test Cases
  test("TC-005: User attempts to log out without providing a token", async () => {
    const res = await request(app).get("/api/auth/signout");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token provided");
  });

  test("TC-006: User logs out with an invalid JWT token", async () => {
    const res = await request(app)
      .get("/api/auth/signout")
      .set("Authorization", "Bearer invalid_token");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token, authentication failed");
  });

  test("TC-007: User logs out with an expired JWT token", async () => {
    const res = await request(app)
      .get("/api/auth/signout")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token, authentication failed");
  });

  test("TC-008: User logs out with a malformed JWT token (random string instead of JWT)", async () => {
    const res = await request(app)
      .get("/api/auth/signout")
      .set("Authorization", `Bearer ${malformedToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token, authentication failed");
  });

  test("TC-009: User logs out while already logged out (token is missing)", async () => {
    const res = await request(app).get("/api/auth/signout");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token provided");
  });

  // test("TC-010: Server error simulation (database failure)", async () => {
  //   jest.spyOn(User, "findById").mockImplementationOnce(() => {
  //     throw new Error("Database connection failed");
  //   });

  //   const res = await request(app)
  //     .get("/api/auth/signout")
  //     .set("Authorization", `Bearer ${validToken}`);

  //   expect(res.statusCode).toBe(500);
  //   expect(res.body.message).toBe("Internal Server Error");
  // });

  // // 🔄 Edge Test Cases
  // test("TC-014: User logs out using a token with extra spaces before/after", async () => {
  //   const res = await request(app)
  //     .get("/api/auth/signout")
  //     .set("Authorization", `Bearer  ${validToken}  `);

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.message).toBe("User signed out successfully");
  // });

  test("TC-015: User logs out right after signing in (before any other actions)", async () => {
    const newToken = generateToken(user._id);
    const res = await request(app)
      .get("/api/auth/signout")
      .set("Authorization", `Bearer ${newToken}`);

    expect(res.statusCode).toBe(200);
  });

  // test("TC-020: Rate-limiting test (multiple requests in a short time)", async () => {
  //   for (let i = 0; i < 5; i++) {
  //     await request(app)
  //       .get("/api/auth/signout")
  //       .set("Authorization", `Bearer ${validToken}`);
  //   }

  //   const res = await request(app)
  //     .get("/api/auth/signout")
  //     .set("Authorization", `Bearer ${validToken}`);

  //   expect(res.statusCode).toBe(429);
  //   expect(res.body.message).toBe("Too many requests, try again later");
  // });

  // test("TC-022: User logs out while logged in on another tab (JWT should be invalidated on refresh)", async () => {
  //   const res1 = await request(app)
  //     .get("/api/auth/signout")
  //     .set("Authorization", `Bearer ${validToken}`);

  //   expect(res1.statusCode).toBe(200);

  //   const res2 = await request(app)
  //     .get("/api/auth/signout")
  //     .set("Authorization", `Bearer ${validToken}`);

  //   expect(res2.statusCode).toBe(401);
  //   expect(res2.body.message).toBe("Invalid or expired token");
  // });
});
