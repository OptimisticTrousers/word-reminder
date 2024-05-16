import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Word from "../models/word";
import WordsByDuration from "../models/wordsByDuration";
import User from "../models/user";

const validateDates = (from: Date, to: Date) => {
  if (from > to) {
    throw new Error("'From' date comes before the 'to' date");
  }
};

// @desc Create a new current words by duration
// @route POST /api/users/:userId/wordsByDuration
// @access Private
export const words_by_duration_create = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.userId).exec();
    if (!req.body) {
      // the created words by duration will be one week long with seven words to match Miller's Law of words that the human mind can remember
      const from = new Date();
      const to = new Date();
      to.setDate(from.getDate() + 7);
      const length = user.words.length;
      if (length < 7) {
        const difference = 7 - length;
        const newWords = await Word.aggregate().sample(difference);
        await User.findByIdAndUpdate(req.params.userId, { $push: { words: { $each: newWords } } }).exec();
      }
    }
    const { active, from, to, words } = req.body;
    validateDates(from, to);
    const { userId } = req.params;
    const wordsByDuration = new WordsByDuration({
      userId,
      words,
      from,
      to,
      active,
    });
    await wordsByDuration.save();
    res.status(200).json(wordsByDuration);
  }
);

// @desc    Delete the current words by duration
// @route   DELETE /api/users/:userId/wordsByDuration/:wordsByDurationId
// @access  Private
export const words_by_duration_delete = asyncHandler(async (req, res) => {
  const { wordByDurationId } = req.params;

  const deletedWordsByDuration = await WordsByDuration.findByIdAndDelete(
    wordByDurationId
  ).exec();
  res.status(200).json(deletedWordsByDuration);
});

// @desc    Get the current words by duration
// @route   GET /api/users/:userId/wordsByDuration/:wordsByDurationId
// @access  Private
export const words_by_duration_get = asyncHandler(async (req, res) => {
  const { wordByDurationId } = req.params;

  const wordsByDuration = await WordsByDuration.findById(wordByDurationId).exec();
  res.status(200).json(wordsByDuration);
});

// @desc Update a current words by duration
// @route PUT /api/users/:userId/wordsByDuration/:wordsByDurationId
// @access Private
export const words_by_duration_update = asyncHandler(async (req, res) => {
  const { active, from, to, words } = req.body;
  validateDates(from, to);
  const { wordByDurationId } = req.params;
  const updatedWordsByDuration = await WordsByDuration.findByIdAndUpdate(
    wordByDurationId,
    {
      words,
      from,
      to,
      active,
    },
    { new: true }
  ).exec();

  if (!updatedWordsByDuration) {
    throw new Error("Words by duration not found");
  }
  res.status(200).json(updatedWordsByDuration);
});

// @desc Fetch a random wordsByDuration
// @route GET /api/users/:userId/wordsByDuration
// @access Private
export const words_by_duration_get_random = asyncHandler(async (req, res) => {
  const randomActiveWordsByDuration = await WordsByDuration.findOne({ active: true }).exec();

  if (!randomActiveWordsByDuration) {
    res.status(404).json({ message: "No active WordsByDuration found" });
    return;
  }
  res.status(200).json(randomActiveWordsByDuration);
})
