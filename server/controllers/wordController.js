const asyncHandler = require("express-async-handler");
const Word = require("../models/word");
const User = require("../models/user");
const fetch = require("node-fetch");

// @desc    Get all words
// @route   GET /api/words
// @access  Private
export const word_list = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId)

    res.status(200).json(user.words);
})

// @desc Add new word
// @route POST /api/words
// @access Private
export const word_create = asyncHandler(async (req, res) => {

    const user = User.findById(req.params.userId);
    const word = Word.exists(req.body.word);
    if (word) {

        user.words.push(word);
    } else {

        const data = fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${req.body.word}`)

        const newWord = new Word({
            word: data.word,
            meanings: data.meanings,
            audio: data.phonetics[0].audio
        });

        await newWord.save();
    }

    await user.save();

    res.status(200).json(word);
})

// @desc    Delete single word
// @route   DELETE /api/words/:wordId
// @access  Private
export const word_delete = asyncHandler(async (req, res, next) => {
    const wordId = req.params.wordId;

    const deletedWord = await Word.findByIdAndRemove(wordId).exec();

    res.status(200).json(deletedWord)
})