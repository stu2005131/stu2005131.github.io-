# Math Practice Website

This repository includes a simple Node.js server for practicing high school math questions. Questions and answers are written in LaTeX and can have tags for their source and topic.

## Features
- User registration and login
- Admin interface to upload questions (only admin can upload)
- Tags for each question (e.g., `113學測`, `直線與圓`)
- Users can mark questions as **understood** or **not fully understood**
- Filter questions by tags or by personal status
- Answers hidden until the user clicks "Show Answer"

## Bulk Import
Questions can be imported in bulk using `node import_questions.js yourfile.json`.
The JSON format should be:
```json
[
  {
    "question": "LaTeX text",
    "answer": "LaTeX answer",
    "tags": ["source", "topic"]
  }
]
```
See `server/sample_data.json` for an example.

## Running
```bash
cd server
npm install
npm start
```
The application will start on `http://localhost:3000`.
