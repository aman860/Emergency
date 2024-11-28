import request from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
import User from "../src/models/user";

describe("User Controller Tests", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/test");
  });

  afterEach(async () => {
    await User.deleteMany(); // Clear test database after each test
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /api/users/nearest", () => {
    it("should return the nearest users", async () => {
      await User.create({
        username: "testuser",
        password: "hashedpassword",
        location: { type: "Point", coordinates: [76.717873, 30.704649] },
      });

      const response = await request(app).get(
        "/api/users/nearest?latitude=30.704649&longitude=76.717873&pageNumber=1&perPageData=10"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it("should return 400 if latitude or longitude is missing", async () => {
      const response = await request(app).get("/api/users/nearest");
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Latitude and longitude are required.");
    });
  });

  describe("GET /api/users", () => {
    it("should return all users with pagination", async () => {
      await User.create([
        { username: "user1", password: "hashedpassword" },
        { username: "user2", password: "hashedpassword" },
      ]);

      const response = await request(app).get("/api/users?pageNumber=1&perPageData=2");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body.users.length).toBe(2);
    });
  });

  describe("POST /api/users", () => {
    it("should create a user", async () => {
      const response = await request(app).post("/api/users").send({
        username: "newuser",
        phoneNumber: "1234567890",
        title: "Title",
        description: "Description",
        role: "user",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "user registered successfully");
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a user by ID", async () => {
      const user = await User.create({
        username: "testuser",
        password: "hashedpassword",
      });

      const response = await request(app).get(`/api/users/${user._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("username", "testuser");
    });

    it("should return 404 if user is not found", async () => {
      const response = await request(app).get("/api/users/invalid-id");
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("should update a user by ID", async () => {
      const user = await User.create({
        username: "testuser",
        password: "hashedpassword",
      });

      const response = await request(app)
        .patch(`/api/users/${user._id}`)
        .send({ username: "updateduser" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("username", "updateduser");
    });

    it("should return 404 if user is not found", async () => {
      const response = await request(app).patch("/api/users/invalid-id").send({ username: "updateduser" });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete a user by ID", async () => {
      const user = await User.create({
        username: "testuser",
        password: "hashedpassword",
      });

      const response = await request(app).delete(`/api/users/${user._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "User deleted");
    });

    it("should return 404 if user is not found", async () => {
      const response = await request(app).delete("/api/users/invalid-id");
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });
  });
});
