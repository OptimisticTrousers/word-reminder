import asyncHandler from "express-async-handler";
import fetch from "node-fetch";
import User from "../models/user";
import Word from "../models/word";

// @desc Add new word
// @route POST /api/words
// @access Private
export const word_create = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).exec();
  if (!user) {
    throw new Error("User not found");
  }
  const word = await Word.exists(req.body.word).exec();
  if (word) {
    user.words.push(word._id);
  } else {
    const data = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${req.body.word}`
    );

    const json: any = await data.json();

    const newWord = new Word({
      word: json.word,
      meanings: json.meanings,
      audio: json.phonetics[0].audio,
    });

    await newWord.save();
  }

  await user.save();

  res.status(200).json(word);
});

// @desc    Delete single word
// @route   DELETE /api/words/:wordId
// @access  Private
export const word_delete = asyncHandler(async (req, res) => {
  const wordId = req.params.wordId;

  const deletedWord = await Word.findByIdAndDelete(wordId).exec();

  res.status(200).json(deletedWord);
});

// @desc    Get all words
// @route   GET /api/words
// @access  Private
export const word_list = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).exec();
  if (!user) {
    throw new Error("User not found");
  }

  res.status(200).json(user.words);
});

// @desc    Search for users
// @route   GET /api/words/:query
// @access  Private
export const word_search = asyncHandler(async (req, res) => {
  const { query } = req.params; // Assuming the search query is provided in the URL params

  const words = await Word.find({ $text: { $search: query } });
  res.status(200).json(words);
});

// @desc    Upload files in order to add them into the database
// @route   GET /api/words/upload
// @access  Private
export const word_upload = asyncHandler(async (req, res) => {
  console.log(req.file);
})


