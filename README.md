# Iranta - Server

This is the server code repository for Iranta, a full stack web app by **Kevin Wei** & **Phoebe Law** for learning Esperanto through the spaced repetition algorithm.

- [Link to Live App](https://iranta.now.sh/)
- [Link to Client Repo](https://github.com/thinkful-ei-gecko/phoebe-kevin-esperanto-client)

## API Endpoints

### `GET /api/language`

Returns a JSON object for the language matching the currently logged in user's id, and an array containing all of the words for that language.

**Example response**

```JSON
{
  "language": {
    "id": 1,
    "name": "Esperanto",
    "user_id": 1,
    "head": 5,
    "total_score": 20
  },
  "words": [
    {
      "id": 11,
      "language_id": 1,
      "original": "Dekstra",
      "translation": "Right",
      "next": 12,
      "memory_value": 1,
      "correct_count": 0,
      "incorrect_count": 0
    }
  ]
}
```

#### language

- **`id`**`- integer` - id of user's language
- **`name`**`- string` - name of user's language
- **`user_id`**`- integer` - id of currently logged in user
- **`head`**`- integer` - id of the first word in the sequenced list of words
- **`total_score`**`- integer` - total words answered correctly

#### words

- **`id`**`- integer` - id of word
- **`language_id`**`- integer` - id of the language that this word belongs to
- **`original`**`- string` - the word or phrase in the foreign language
- **`translation`**`- string` - the word or phrase in English
- **`next`**`- integer` - id of the next word in the sequenced list
- **`memory_value`**`- integer` - number used for determining how many spaces down the sequenced list to put the word (this makes up the core of spaced repetition)
- **`correct_count`**`- integer` - how many times this word was answered correctly
- **`incorrect_count`**`- integer` - how many times this word was answered incorrectly

### `POST /api/language/guess`

The user submits a guess for the current word at the head of the sequenced list. The server responds with a JSON object containing the answer as well as the data for the _next_ word.

**Example request**

```JSON
{
  "guess": "Right"
}
```

**Example response**

```JSON
{
  "nextWord": 12,
  "totalScore": 21,
  "wordCorrectCount": 0,
  "wordIncorrectCount": 0,
  "answer": "Right",
  "isCorrect": true
}
```

- **`nextWord`**`- integer` - id of the next word in the sequenced list
- **`totalScore`**`- integer` - total words answered correctly
- **`wordCorrectCount`**`- integer` - how many times the _next_ word was answered correctly
- **`wordIncorrectCount`**`- integer` - how many times the _next_ word was answered incorrectly
- **`answer`**`- string` - the English translation for _this_ word or phrase
- **`isCorrect`**`- boolean` - true or false given if the correct guess was submitted for _this_ word

## Technology Stack

### Backend
- **Express** for handling API requests
- **Knex.js** for interfacing with the **PostgreSQL** database
- **Postgrator** for database migration
- **Mocha**, **Chai**, **Supertest** for endpoints testing
- **JSON Web Token**, **bcryptjs** for user authentication / authorization

### Frontend

- **React** + **React Router**, **HTML5**, **CSS3** for client-side view
- **Cypress** for end-to-end testing
