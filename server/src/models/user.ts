import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define a schema for words in the user model
const UserWordSchema = new Schema({
  word: { type: Schema.Types.ObjectId, ref: "Word", required: true },
  learned: { type: Boolean, default: false, required: true }, // Custom attribute to track if the word has been learned
});

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
    words: [{ type: [UserWordSchema], required: true, default: [] }],
    wordsByDuration: [
      {
        type: Schema.Types.ObjectId,
        ref: "WordsByDuration",
        required: true,
        default: [],
      },
    ],
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

UserSchema.virtual("wordCount").get(function () {
  if (!this.words) {
    return 0;
  }
  return this.words.length;
});

UserSchema.virtual("wordsByDurationCount").get(function () {
  if (!this.wordsByDuration) {
    return 0;
  }
  return this.wordsByDuration.length;
});

export default mongoose.model("User", UserSchema);
