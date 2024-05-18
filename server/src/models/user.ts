import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, index: true, unique: true },
    password: { type: String, required: true, index: true },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        // Delete password for security reasons so that the client doesn't have access to the password field
        delete ret.password;
      },
    },
  }
);

export default mongoose.model("User", UserSchema);
