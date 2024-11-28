import request from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
import User from "../src/models/user";
import bcrypt from "bcryptjs";

describe("Auth Controller", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/test");
  });

  afterEach(async () => {
    await User.deleteMany(); // Clear the database after each test
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /api/auth/register", () => {
    it("should register a user and return a token", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "testuser",
          password: "password123",
          phoneNumber: "1234567890",
          title: "Test Title",
          description: "Test Description",
          longitude: 76.717873,
          latitude: 30.704649,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "User registered successfully");
      expect(response.body).toHaveProperty("token");
    });

    it("should return 400 if username or password is missing", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "testuser",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "All fields are required");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should log in a user and return a token", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        username: "testuser",
        password: hashedPassword,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });
  });
});
