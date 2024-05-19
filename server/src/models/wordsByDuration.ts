import mongoose from "mongoose";
const Schema = mongoose.Schema;

const WordsByDurationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    words: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserWord",
        default: [],
        required: true,
      },
    ],
    options: {
      isActive: { type: Boolean, required: true },
      hasReminderOnLoad: { type: Boolean, required: true },
      hasDuplicateWords: { type: Boolean, required: true },
      recurring: {
        isRecurring: { type: Boolean, required: true },
        interval: { type: String, required: true },
      },
      reminder: { type: String, required: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

WordsByDurationSchema.virtual("wordCount").get(function () {
  if (!this.words) {
    return 0;
  }
  return this.words.length;
});

export default mongoose.model("WordsByDuration", WordsByDurationSchema);
