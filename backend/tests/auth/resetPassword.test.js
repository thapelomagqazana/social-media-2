import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import User from "../../models/User";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

/**
 * @desc Setup in-memory MongoDB server before running tests
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

/**
 * @desc Cleanup after tests
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Seed database with a test user
  await User.create({
    name: "Test User",
    email: "user@example.com",
    password: "Password123!",
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
});

/**
 * @desc Clear database between tests
 */
afterEach(async () => {
  await User.deleteMany({});
});

/**
 * @desc Helper function to make a request to the reset-password endpoint
 */
const requestResetPassword = async (email) => {
  return request(app).post("/api/auth/reset-password").send({ email });
};

/**
 * ✅ Positive Test Cases
 */
describe("POST /api/auth/reset-password - Positive Cases", () => {
  test("TC-001: User submits a registered email", async () => {
    const res = await requestResetPassword("user@example.com");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password reset email sent. Check your inbox.");
  });

  test("TC-002: User submits a valid email with extra spaces", async () => {
    const res = await requestResetPassword("  user@example.com  ");
    expect(res.statusCode).toBe(200);
  });

  test("TC-003: User submits a valid email in uppercase", async () => {
    const res = await requestResetPassword("USER@EXAMPLE.COM");
    expect(res.statusCode).toBe(200);
  });

  test("TC-004: User requests multiple reset links", async () => {
    await requestResetPassword("user@example.com"); // First request
    const res = await requestResetPassword("user@example.com"); // Second request
    expect(res.statusCode).toBe(200);
  });

  test("TC-005: User requests reset link within expiration time", async () => {
    await requestResetPassword("user@example.com");
    const res = await requestResetPassword("user@example.com");
    expect(res.statusCode).toBe(200);
  });
});

/**
 * ❌ Negative Test Cases
 */
describe("POST /api/auth/reset-password - Negative Cases", () => {
  test("TC-006: User submits an empty request body", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Email is required");
  });

  test("TC-007: User submits a blank email field", async () => {
    const res = await requestResetPassword("");
    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Email is required");
  });

  test("TC-008: User submits an invalid email format", async () => {
    const res = await requestResetPassword("invalid-email");
    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Invalid email format");
  });

  test("TC-009: User submits an unregistered email", async () => {
    const res = await requestResetPassword("notfound@example.com");
    expect(res.statusCode).toBe(404);
  });

//   test("TC-010: User requests a reset link for an inactive account", async () => {
//     await User.create({
//       name: "Inactive User",
//       email: "inactive@example.com",
//       password: "Password123!",
//       isActive: false,
//     });

//     const res = await requestResetPassword("inactive@example.com");
//     expect(res.statusCode).toBe(403);
//   });

  test("TC-011: User requests reset password for a deleted account", async () => {
    await User.create({
      name: "Deleted User",
      email: "deleted@example.com",
      password: "Password123!",
    });

    await User.deleteOne({ email: "deleted@example.com" });

    const res = await requestResetPassword("deleted@example.com");
    expect(res.statusCode).toBe(404);
  });

  test("TC-012: User submits null email value", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({ email: null });
    expect(res.statusCode).toBe(400);
  });

  test("TC-013: Server error scenario (simulate DB failure)", async () => {
    jest.spyOn(User, "findOne").mockImplementation(() => {
      throw new Error("Database error");
    });

    const res = await requestResetPassword("user@example.com");
    expect(res.statusCode).toBe(500);
  });
});

/**
 * 🔄 Edge Test Cases
 */
describe("POST /api/auth/reset-password - Edge Cases", () => {
//   test("TC-014: User submits an email with leading/trailing spaces", async () => {
//     const res = await requestResetPassword("  user@example.com  ");
//     expect(res.statusCode).toBe(200);
//   });

  test("TC-015: User submits an extremely long email address", async () => {
    const longEmail = "a".repeat(300) + "@example.com";
    const res = await requestResetPassword(longEmail);
    expect(res.statusCode).toBe(400);
  });

  test("TC-016: User submits email with special characters", async () => {
    const res = await requestResetPassword("us#er@exam!ple.com");
    expect(res.statusCode).toBe(400);
  });

  test("TC-017: User attempts SQL injection via email", async () => {
    const res = await requestResetPassword("' OR '1'='1");
    expect(res.statusCode).toBe(400);
  });

  test("TC-018: User attempts script injection", async () => {
    const res = await requestResetPassword('<script>alert("Hacked")</script>');
    expect(res.statusCode).toBe(400);
  });

//   test("TC-019: User submits email in mixed case with spaces", async () => {
//     const res = await requestResetPassword("  UserExample@EMAIL.Com  ");
//     expect(res.statusCode).toBe(200);
//   });

//   test("TC-020: Rate-limiting test (multiple requests in a short time)", async () => {
//     for (let i = 0; i < 5; i++) {
//       await requestResetPassword("user@example.com");
//     }
//     const res = await requestResetPassword("user@example.com");
//     console.log(res.body.message);
//     expect(res.statusCode).toBe(429);
//   });

  test("TC-021: User attempts password reset while offline", async () => {
    jest.spyOn(request(app), "post").mockImplementation(() => {
      throw new Error("Network error");
    });

    const res = await requestResetPassword("user@example.com");
    expect(res.statusCode).toBe(500);
  });
});
