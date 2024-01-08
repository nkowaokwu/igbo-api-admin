/**
 * Removes duplicate Example Suggestions based on the most pronunciations present
 */
const fs = require('fs');
const exampleSuggestions = require('./exampleSuggestions.json');

const deDuppedExampleSuggestions = [];
const duppedExampleSuggestions = [];
exampleSuggestions.forEach((exampleSuggestion) => {
  const deDuppedExampleSuggestionIndex = deDuppedExampleSuggestions.findIndex(
    ({ igbo }) => igbo === exampleSuggestion.igbo,
  );
  const deDuppedExampleSuggestion = deDuppedExampleSuggestions[deDuppedExampleSuggestionIndex];
  if (deDuppedExampleSuggestionIndex === -1) {
    deDuppedExampleSuggestions.push(exampleSuggestion);
  } else if (
    deDuppedExampleSuggestionIndex !== -1 &&
    exampleSuggestion?.pronunciations?.length > deDuppedExampleSuggestion?.pronunciations?.length
  ) {
    deDuppedExampleSuggestion[deDuppedExampleSuggestionIndex] = exampleSuggestion;
  } else if (deDuppedExampleSuggestionIndex !== -1) {
    duppedExampleSuggestions.push(exampleSuggestion);
  }
});

// console.log(exampleSuggestions.length);
// console.log(deDuppedExampleSuggestions.length);
// console.log(duppedExampleSuggestions.length);

fs.writeFileSync('./cleaned-example-suggestions.json', JSON.stringify(deDuppedExampleSuggestions), {
  encoding: 'utf-8',
});
fs.writeFileSync('./dupped-example-suggestions.json', JSON.stringify(duppedExampleSuggestions), {
  encoding: 'utf-8',
});
