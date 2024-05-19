import { Types } from "mongoose";
import agenda from "../app";

const activateWordsByDuration = async (
  from: Date,
  wordsByDurationId: Types.ObjectId | string
) => {
  await agenda.schedule(from, "activate_words_by_duration", {
    wordsByDurationId,
  });
};

export default activateWordsByDuration;
