import { countRecordExampleAudio, countVerifyExampleAudio, countTranslateIgboSentence } from '../countingFunctions';

describe('countingFunctions', () => {
  it('counts the number of audio recordings for an example suggestions', () => {
    const uid = 'first';
    const exampleSuggestions = [
      {
        igbo: 'igbo',
        english: 'english',
        pronunciations: [
          { audio: 'first', speaker: 'first' },
          { audio: 'second', speaker: 'first' },
          { audio: 'third', speaker: 'second' },
        ],
      },
    ];
    // @ts-expect-error
    const result = countRecordExampleAudio({ exampleSuggestions, uid });
    expect(result).toEqual(2);
  });

  it('counts the number of verified recordings of example suggestions by the current user', () => {
    const uid = 'first';
    const exampleSuggestions = [
      {
        igbo: 'igbo',
        english: 'english',
        pronunciations: [
          { audio: 'first', speaker: 'first', approvals: ['second', 'third'], denials: [] },
          { audio: 'second', speaker: 'first', approvals: ['second', 'third'], denials: [] },
          { audio: 'third', speaker: 'second', approvals: ['first', 'third'], denials: [] },
          { audio: 'third', speaker: 'second', approvals: [], denials: ['first', 'third'] },
        ],
      },
    ];
    // @ts-expect-error
    const result = countVerifyExampleAudio({ exampleSuggestions, uid });
    expect(result).toEqual(2);
  });

  it('counts the number of sentences a user has interacted with specifically for translating sentences', () => {
    const uid = 'first';
    const exampleSuggestions = [
      {
        igbo: 'igbo',
        english: 'english',
        userInteractions: ['first'],
      },
    ];
    // @ts-expect-error
    const result = countTranslateIgboSentence({ exampleSuggestions, uid });
    expect(result).toEqual(1);
  });
});
