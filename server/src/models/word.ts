import mongoose from "mongoose";
const Schema = mongoose.Schema;

const WordSchema = new Schema(
  {
    word: { type: String, required: true, unique: true },
    origin: { type: String },
    phonetic: { type: String, required: true },
    meanings: [
      {
        partOfSpeech: { type: String, required: true },
        definitions: [
          {
            definition: { type: String, required: true },
            example: { type: String },
            synonyms: [{ type: String }],
            antonyms: [{ type: String }],
          },
        ],
      },
    ],
    audio: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

WordSchema.virtual("meaningCount").get(function () {
  if (!this.meanings) {
    return 0;
  }
  return this.meanings.length;
});

export default mongoose.model("Word", WordSchema);
