import asyncHandler from "express-async-handler";
import WordsByDuration from "../models/wordsByDuration";


const validateDates = (from: Date, to: Date) => {
  if (from > to) {
    throw new Error("'From' date comes before the 'to' date")
  }
}

// @desc Create a new current words by duration
// @route POST /api/users/:userId/wordsByDuration
// @access Private
export const words_by_duration_create = asyncHandler(async (req, res) => {
  const { words, from, to } = req.body;
  validateDates(from, to);
  const { userId } = req.params;
  const wordsByDuration = new WordsByDuration({ userId, words, from, to });
  await wordsByDuration.save();
  res.status(200).json(wordsByDuration);
});

// @desc    Delete the current words by duration
// @route   DELETE /api/users/:userId/wordsByDuration
// @access  Private
export const words_by_duration_delete = asyncHandler(async (req, res) => {
  const { wordByDurationId } = req.params;

  const deletedWordsByDuration = await WordsByDuration.findByIdAndDelete(
    wordByDurationId
  );
  res.status(200).json(deletedWordsByDuration);
});

// @desc    Get the current words by duration
// @route   GET /api/users/:userId/wordsByDuration
// @access  Private
export const words_by_duration_get = asyncHandler(async (req, res) => {
  const { wordByDurationId } = req.params;

  const wordsByDuration = await WordsByDuration.findById(wordByDurationId);
  res.status(200).json(wordsByDuration);
});

// @desc Update a current words by duration
// @route PUT /api/users/:userId/wordsByDuration/:wordByDurationId
// @access Private
export const words_by_duration_update = asyncHandler(async (req, res) => {
  const { words, from, to } = req.body;
  validateDates(from, to);
  const { wordByDurationId } = req.params;
  const updatedWordsByDuration = await WordsByDuration.findByIdAndUpdate(
    wordByDurationId,
    {
      words,
      from,
      to,
    },
    { new: true }
  ).exec();


  if (!updatedWordsByDuration) {
    throw new Error("Words by duration not found");
  }
  res.status(200).json(updatedWordsByDuration);
});
