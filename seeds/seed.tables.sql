BEGIN;

TRUNCATE
  "word",
  "language",
  "user";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (
    1,
    'admin',
    'Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'Esperanto', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next")
VALUES
  (1, 1, 'Saluton! Kiel vi fartas?', 'Hi! How are you?', 2),
  (2, 1, 'Tre bone, dankon.', `I'm good, thanks.`, 3),
  (3, 1, 'Nia nomo estas...', 'My name is...', 4),
  (4, 1, 'Kie estas la necesejo?', 'Where is the bathroom?', 5),
  (5, 1, 'Kie mi povas aĉeti trinkeblan botelojn de akvo?', 'Where can I buy clean bottled water?', 6),
  (6, 1, 'Voku la policon!', 'Call the police!', 7),
  (7, 1, 'Mi volas unon biron.', 'I want a beer.', 8),
  (8, 1, 'Jes', 'Yes', 9),
  (9, 1, 'Ne', 'No', 10),
  (10, 1, 'Mi ne scias.', `I don't know.`, 11),
  (11, 1, 'Dekstra', 'Right', 12),
  (12, 1, 'Maldekstra', 'Left', 13),
  (13, 1, 'Rekte', 'Ahead', 14),
  (14, 1, 'Helpon!', 'Help!', 15),
  (15, 1, 'Fajon!', 'Fire!', 16),
  (16, 1, 'Voku ambulancon.', 'Call an ambulance.', 17),
  (17, 1, 'Pafilo!', 'Gun!', null);

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;
