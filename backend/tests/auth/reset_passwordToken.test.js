import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import User from "../../models/User";

let mongoServer;

/**
 * Setup and teardown the in-memory MongoDB before running tests
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/auth/reset-password/:token", () => {
  let validUser, validToken, expiredToken, deletedUser, hashedPassword;

  /**
   * ✅ Create mock users and tokens before each test
   */
  beforeEach(async () => {
    validToken = "valid-reset-token";
    expiredToken = "expired-reset-token";

    validUser = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: "OldPassword@123",
      resetPasswordToken: validToken,
      resetPasswordExpires: Date.now() + 10 * 60 * 1000, // Valid for 10 minutes
    });

    deletedUser = await User.create({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "OldPassword@123",
      resetPasswordToken: validToken,
      resetPasswordExpires: Date.now() + 10 * 60 * 1000,
    });

    await User.deleteOne({ _id: deletedUser._id }); // Simulate deleted user
  });

  afterEach(async () => {
    await User.deleteMany(); // Cleanup after each test
  });

  /**
   * ✅ Positive Test Cases
   */
  test("TC-001: User resets password with a valid token", async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/${validToken}`)
      .send({ newPassword: "NewPassword@123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password reset successfully. You can now sign in.");
  });

  test("TC-002: User resets password with a strong password", async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/${validToken}`)
      .send({ newPassword: "VeryStrongPass12@" });

    expect(res.statusCode).toBe(200);
  });

  test("TC-003: User resets password within token expiration time", async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/${validToken}`)
      .send({ newPassword: "TimeValidPass@456" });

    expect(res.statusCode).toBe(200);
  });

  /**
   * ❌ Negative Test Cases
   */
  test("TC-004: User provides an expired token", async () => {
    await User.updateOne({ resetPasswordToken: expiredToken }, { resetPasswordExpires: Date.now() - 1000 });

    const res = await request(app)
      .post(`/api/auth/reset-password/${expiredToken}`)
      .send({ newPassword: "NewPass@123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid or expired password reset token.");
  });

  test("TC-005: User submits an empty password field", async () => {
    const res = await request(app).post(`/api/auth/reset-password/${validToken}`).send({ newPassword: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("New password is required.");
  });

  test("TC-006: User submits a password that is too short", async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/${validToken}`)
      .send({ newPassword: "1234" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Password must be at least 8 characters long.");
  });

  test("TC-007: User provides a non-existent token", async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/nonexistent-token`)
      .send({ newPassword: "ValidPass@123" });

    expect(res.statusCode).toBe(400);
  });

  test("TC-008: User sends a malformed token", async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/invalid<>token`)
      .send({ newPassword: "ValidPass@123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid or expired password reset token.");
  });

  test("TC-009: User tries to reset password without a token", async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/`)
      .send({ newPassword: "ValidPass@123" });

    expect(res.statusCode).toBe(400); // Endpoint missing token param
  });

  test("TC-010: User sends an expired token in the database", async () => {
    await User.updateOne({ _id: validUser._id }, { resetPasswordExpires: Date.now() - 10000 });

    const res = await request(app)
      .post(`/api/auth/reset-password/${validToken}`)
      .send({ newPassword: "ValidPass@123" });

    expect(res.statusCode).toBe(400);
  });

//   test("TC-011: User submits a weak password", async () => {
//     const res = await request(app)
//       .post(`/api/auth/reset-password/${validToken}`)
//       .send({ newPassword: "password123" });

//     expect(res.statusCode).toBe(400);
//   });

//   test("TC-012: Unauthorized request (missing token)", async () => {
//     const res = await request(app).post(`/api/auth/reset-password/`);

//     expect(res.statusCode).toBe(404);
//   });

//   test("TC-013: Token is valid, but user is deleted", async () => {
//     const res = await request(app)
//       .post(`/api/auth/reset-password/${validToken}`)
//       .send({ newPassword: "ValidPass@123" });

//     expect(res.statusCode).toBe(400);
//   });

  /**
   * 🔄 Edge Test Cases
   */
  test("TC-015: User submits password with exactly 8 characters", async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/${validToken}`)
      .send({ newPassword: "P@ssw0rd" });

    expect(res.statusCode).toBe(200);
  });

  test("TC-016: User submits password with 64 characters", async () => {
    const longPassword = "A".repeat(64);
    const res = await request(app)
      .post(`/api/auth/reset-password/${validToken}`)
      .send({ newPassword: longPassword });

    expect(res.statusCode).toBe(200);
  });

  test("TC-017: User submits a password with special characters", async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/${validToken}`)
      .send({ newPassword: "!@#$%^&*()_+" });

    expect(res.statusCode).toBe(200);
  });

  test("TC-018: User submits a password that is too long (500+ chars)", async () => {
    const longPassword = "A".repeat(500);
    const res = await request(app)
      .post(`/api/auth/reset-password/${validToken}`)
      .send({ newPassword: longPassword });

    expect(res.statusCode).toBe(400);
  });

  test("TC-020: Database goes down while processing request", async () => {
    await mongoose.disconnect(); // Simulate DB failure

    const res = await request(app)
      .post(`/api/auth/reset-password/${validToken}`)
      .send({ newPassword: "NewPass@123" });

    expect(res.statusCode).toBe(500);
    await mongoose.connect(mongoServer.getUri()); // Reconnect DB
  });
});
