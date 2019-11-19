const LanguageService = {
  updateHead(db, id, head) {
    return db('language')
      .where({ id })
      .update({ head });
  },

  updateWord(db, id, next) {
    return db('word')
      .where({ id })
      .update({ next });
  },

  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .orderBy('next')
      .where({ language_id });
  },

  getNextWord(db, language_id) {
    return db
      .select(
        'word.original',
        'language.total_score',
        'word.correct_count',
        'word.incorrect_count'
      )
      .from('word')
      .join('language', 'language.user_id', 'language_id')
      .where({ language_id })
      .first();
  },
};

module.exports = LanguageService;
