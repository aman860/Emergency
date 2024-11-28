import mongoose, { Document, Schema } from "mongoose";
// Define the allowed roles
type Role = "user" | "admin" | "doctor" | "ambulance";
export interface IUser extends Document {
  username: string;
  password: string;
  phoneNumber: string;
  title: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  role:Role
}

const UserSchema: Schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: {type: String},
  title: {type: String},
  description: {type: String},
  location: {
    type: {
      type: String,
      enum: ["Point"], // Only GeoJSON "Point" type is allowed
      required: true,
    },
    coordinates: {
      type: [Number], // An array with two numbers: [longitude, latitude]
      required: true,
      validate: {
        validator: function (value: number[]) {
          return value.length === 2; // Ensure exactly 2 coordinates
        },
        message: "Coordinates must have exactly two values: [longitude, latitude]",
      },
    },
  },
  role: {
    type: String,
    enum: ["user", "admin", "doctor", "ambulance"], // Enum specifies valid values
    default: "user", // Default role is 'user'
    required: true,
  },
});
UserSchema.index({ location: "2dsphere" });
export default mongoose.model<IUser>("User", UserSchema);
