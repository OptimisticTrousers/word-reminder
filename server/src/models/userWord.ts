import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define a schema for words in the user model
const UserWordSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    word: { type: Schema.Types.ObjectId, ref: "Word", required: true },
    learned: { type: Boolean, default: false, required: true }, // Custom attribute to track if the word has been learned
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UserWord", UserWordSchema);
