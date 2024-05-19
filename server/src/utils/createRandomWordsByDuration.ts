import { Document, Types } from "mongoose";
import UserWord from "../models/userWord";
import WordsByDuration from "../models/wordsByDuration";

const createRandomWordsByDuration = async (
  from: Date,
  to: Date,
  userId: string,
  wordsByDurationLength: number,
  active: boolean,
  duplicateWords: boolean,
  recurring: boolean,
  failureCallback: (length: number) => void,
  successCallback: (wordsByDuration: Document) => void,
  scheduleCallback: (wordsByDurationId: Types.ObjectId) => void
) => {
  if (duplicateWords) {
    const randomWords = await UserWord.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $lookup: {
          from: "wordsByDuration",
          localField: "_id",
          foreignField: "words",
          as: "usedInWordByDurations",
        },
      },
      {
        $match: {
          "usedInWordByDurations.0": { $exists: false },
        },
      },
      {
        $sample: { size: wordsByDurationLength },
      },
    ]);
    if (randomWords.length < wordsByDurationLength) {
      failureCallback(randomWords.length);
      return;
    }
    const wordsByDuration = new WordsByDuration({
      userId,
      words: randomWords,
      from,
      to,
      active,
      recurring,
    });
    await wordsByDuration.save();
    scheduleCallback(wordsByDuration._id);
    successCallback(wordsByDuration);
    return;
  } else {
    const randomWords = await UserWord.find({}).limit(wordsByDurationLength);
    const wordsByDuration = new WordsByDuration({
      userId,
      words: randomWords,
      from,
      to,
      active,
      recurring,
    });
    await wordsByDuration.save();
    scheduleCallback(wordsByDuration._id);
    successCallback(wordsByDuration);
    return;
  }
};

export default createRandomWordsByDuration;
