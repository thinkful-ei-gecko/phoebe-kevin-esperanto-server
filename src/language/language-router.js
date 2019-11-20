const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const languageRouter = express.Router();
const jsonParser = express.json();

languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`,
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/', async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );

    res.json({
      language: req.language,
      words,
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/head', async (req, res, next) => {
  try {
    const nextWord = await LanguageService.getNextWord(
      req.app.get('db'),
      req.language.id
    );

    res.json({
      nextWord: nextWord.original,
      totalScore: nextWord.total_score,
      wordCorrectCount: nextWord.correct_count,
      wordIncorrectCount: nextWord.incorrect_count,
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.post('/guess', jsonParser, async (req, res, next) => {
  let { guess } = req.body;
  if (!guess) {
    return res.status(400).json({ error: `Missing 'guess' in request body` });
  }

  try {
    let currHeadId = req.language.head;
    let currWord = await LanguageService.getWord(
      req.app.get('db'),
      currHeadId,
      req.language.id
    );
    let answer = currWord.translation;
    let isCorrect;

    if (answer !== guess) {
      currWord.memory_value = 1;
      currWord.incorrect_count++;
      isCorrect = false;
    } else {
      currWord.memory_value *= 2;
      currWord.correct_count++;
      req.language.total_score++;
      isCorrect = true;
    }

    const wordsArr = [];
    const tempArr = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );
    wordsArr[0] = currWord;
    for (let i = 1; i < tempArr.length; i++) {
      const previousElement = wordsArr[i - 1];
      const nextWord = await LanguageService.getWord(
        req.app.get('db'),
        previousElement.next,
        req.language.id
      );
      wordsArr.push(nextWord);
    }

    const wordToInsertAfter = wordsArr[currWord.memory_value];
    currWord.next = wordToInsertAfter.next;
    wordToInsertAfter.next = currWord.id;

    // CREATE UPDATE FIELDS
    let currWord_updateFields = {
      memory_value: currWord.memory_value,
      incorrect_count: currWord.incorrect_count,
      correct_count: currWord.correct_count,
      next: currWord.next,
    };
    let wordToInsertAfter_updateFields = {
      next: wordToInsertAfter.next,
    };
    // set head to next word (second element of array)
    let language_updateFields = {
      head: wordsArr[1].id,
      total_score: req.language.total_score,
    };

    // UPDATE DATABASE
    await LanguageService.updateRow(
      req.app.get('db'),
      'word',
      currWord.id,
      currWord_updateFields
    );
    await LanguageService.updateRow(
      req.app.get('db'),
      'word',
      wordToInsertAfter.id,
      wordToInsertAfter_updateFields
    );
    await LanguageService.updateRow(
      req.app.get('db'),
      'language',
      req.language.id,
      language_updateFields
    );

    return res.json({
      nextWord: wordsArr[1].original,
      totalScore: req.language.total_score,
      wordCorrectCount: wordsArr[1].correct_count,
      wordIncorrectCount: wordsArr[1].incorrect_count,
      answer,
      isCorrect,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
