const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UserService = {
  hasUserWithUserName(db, username) {
    return db('user')
      .where({ username })
      .first()
      .then((user) => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('user')
      .returning('*')
      .then(([user]) => user);
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(user) {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
    };
  },
  populateUserWords(db, user_id) {
    return db.transaction(async (trx) => {
      const [languageId] = await trx
        .into('language')
        .insert([{ name: 'Esperanto', user_id }], ['id']);

      // when inserting words,
      // we need to know the current sequence number
      // so that we can set the `next` field of the linked language
      const seq = await db
        .from('word_id_seq')
        .select('last_value')
        .first();

      const languageWords = [
        ['Saluton! Kiel vi fartas?', 'Hi! How are you?', 2],
        ['Tre bone, dankon.', 'I\'m good, thanks.', 3],
        ['Mia nomo estas...', 'My name is...', 4],
        ['Kie estas la necesejo?', 'Where is the bathroom?', 5],
        ['Kie mi povas a&#265;eti trinkeblan botelojn de akvo?', 'Where can I buy clean bottled water?', 6],
        ['Voku la policon!', 'Call the police!', 7],
        ['Mi volas unon biron.', 'I want a beer.', 8],
        ['Jes', 'Yes', 9],
        ['Ne', 'No', 10],
        ['Mi ne scias.', 'I don\'t know.', 11],
        ['Dekstra', 'Right', 12],
        ['Maldekstra', 'Left', 13],
        ['Rekte', 'Ahead', 14],
        ['Helpon!', 'Help!', 15],
        ['Fajon!', 'Fire!', 16],
        ['Voku ambulancon.', 'Call an ambulance.', 17],
        ['Pafilo!', 'Gun!', null],
      ];

      const [languageHeadId] = await trx.into('word').insert(
        languageWords.map(([original, translation, nextInc]) => ({
          language_id: languageId.id,
          original,
          translation,
          next: nextInc ? Number(seq.last_value) + nextInc : null,
        })),
        ['id']
      );

      await trx('language')
        .where('id', languageId.id)
        .update({
          head: languageHeadId.id,
        });
    });
  },
};

module.exports = UserService;
