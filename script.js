const fs = require("fs");

fs.readFile("Task.txt", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const questions = extractQuestions(data);
  const jsonData = convertToJSON(questions);

  fs.writeFile("output.json", JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("JSON data has been written to output.json");
  });
});

function extractQuestions(text) {
  const lines = text.split("\n");
  const questions = [];
  let currentQuestion = null;

  for (const line of lines) {
    if (line.includes("Question ID:")) {
      currentQuestion = {
        questionId: parseInt(line.split(":")[1]),
        questionText: "",
        options: [],
        solutionText: "",
      };
    } else if (line.includes("Answer")) {
      const correctOption = line.match(/\(([A-Z])\)/)[1];
      currentQuestion.options.forEach(
        (option) => (option.isCorrect = option.optionNumber === correctOption)
      );
    } else if (line.includes("Sol.")) {
      currentQuestion.solutionText = line.substring(5).trim();
      questions.push(currentQuestion);
    } else if (currentQuestion && currentQuestion.options.length < 4) {
      if (line.trim().startsWith("(")) {
        const [optionNumber, optionText] = line
          .split(")")
          .map((item) => item.trim().substring(1));
        currentQuestion.options.push({
          optionNumber,
          optionText,
          isCorrect: false,
        });
      } else {
        currentQuestion.questionText += line.trim() + "\n";
      }
    }
  }

  return questions;
}

function convertToJSON(questions) {
  return questions.map((question, index) => ({
    questionNumber: index + 1,
    questionId: question.questionId,
    questionText: question.questionText.trim(),
    options: question.options,
    solutionText: question.solutionText.trim(),
  }));
}
