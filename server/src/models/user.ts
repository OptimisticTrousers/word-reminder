import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    words: [
      { type: Schema.Types.ObjectId, ref: "Word", default: [], required: true },
    ],
    wordsByDuration: { type: Schema.Types.ObjectId, ref: "WordsByDuration" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        // Delete password for security reasons so that the client doesn't have access to the password field
        delete ret.password;
      },
    },
  }
);

export default mongoose.model("User", UserSchema);
