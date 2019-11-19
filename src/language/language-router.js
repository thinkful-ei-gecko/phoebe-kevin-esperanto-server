const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const LinkedList = require('../util/linked-list');
const languageRouter = express.Router();
const jsonParser = express.json();

const wordsLL = new LinkedList();

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

    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );

    wordsLL.head = null;
    for (let i = 0; i < words.length; i++) {
      wordsLL.insertLast(words[i]);
    }

    // wordsLL.display();

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

  let currNode = wordsLL.head;
  let nextNode = currNode.next;
  let word = currNode.value;
  let answer = word.translation;
  let isCorrect;

  try {
    if (answer !== guess) {
      word.memory_value = 1;
      // word.incorrect_count++;
      isCorrect = false;
    } else {
      word.memory_value *= 2;
      // word.correct_count++;
      isCorrect = true;
    }

    if (word.memory_value === 1) {
      currNode.next = nextNode.next;
      nextNode.next = currNode;
      wordsLL.head = nextNode;
    } else {
      let count = 2;
      while (currNode.next !== null) {
        nextNode = currNode.next;
        if (count === word.memory_value) {
          currNode.next = nextNode.next;
          nextNode.next = currNode;
          wordsLL.head = nextNode;
          break;
        }
        currNode = currNode.next;
        count++;
      }
    }

    LanguageService.updateHead(req.app.get('db'), req.language.id, wordsLL.head.value.id);
    LanguageService.updateWord(
      req.app.get('db'),
      currNode.value.id,
      currNode.next.value.id
    );
    LanguageService.updateWord(
      req.app.get('db'),
      nextNode.value.id,
      nextNode.next.value.id
    );

    res.json({
      nextWord: wordsLL.head.value.original,
      totalScore: 0,
      wordCorrectCount: isCorrect ? word.correct_count++ : word.correct_count,
      wordIncorrectCount: !isCorrect ? word.incorrect_count++ : word.incorrect_count,
      answer,
      isCorrect,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
