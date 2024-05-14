import mongoose from "mongoose";
const Schema = mongoose.Schema;

const WordsByDurationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    words: [
      {
        type: Schema.Types.ObjectId,
        ref: "Word",
        default: [],
        required: true,
      },
    ],
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    active: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

WordsByDurationSchema.virtual("currentWordCount").get(function () {
  if (!this.words) {
    return 0;
  }
  return this.words.length;
});

export default mongoose.model("WordsByDuration", WordsByDurationSchema);
