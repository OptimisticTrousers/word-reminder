import { Document, Types } from "mongoose";
import UserWord from "../models/userWord";
import WordsByDuration from "../models/wordsByDuration";

const createRandomWordsByDuration = async (
  userId: string,
  from: Date,
  to: Date,
  wordsByDurationLength: number,
  options: {
    isActive: boolean;
    hasReminderOnLoad: boolean;
    hasDuplicateWords: boolean;
    recurring: {
      isRecurring: boolean;
      interval: string;
    };
    reminder: string;
  },
  failureCallback: (length: number) => void,
  successCallback: (wordsByDuration: Document) => void,
  scheduleCallback: (wordsByDurationId: Types.ObjectId) => void
) => {
  const {
    isActive,
    hasReminderOnLoad,
    hasDuplicateWords,
    recurring: { isRecurring, interval },
    reminder,
  } = options;
  if (options.hasDuplicateWords) {
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
      from,
      to,
      words: randomWords,
      options: {
        isActive,
        hasReminderOnLoad,
        hasDuplicateWords,
        recurring: { isRecurring, interval },
        reminder,
      },
    });
    await wordsByDuration.save();
    scheduleCallback(wordsByDuration._id);
    successCallback(wordsByDuration);
    return;
  } else {
    const randomWords = await UserWord.find({}).limit(wordsByDurationLength);
    const wordsByDuration = new WordsByDuration({
      userId,
      from,
      to,
      words: randomWords,
      options: {
        isActive,
        hasReminderOnLoad,
        hasDuplicateWords,
        recurring: { isRecurring, interval },
        reminder,
      },
    });
    await wordsByDuration.save();
    scheduleCallback(wordsByDuration._id);
    successCallback(wordsByDuration);
    return;
  }
};

export default createRandomWordsByDuration;
