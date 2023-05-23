import assignEditorsToDialects from '../assignEditorsToDialects';

const clientData = {
  word: 'word',
  dialects: [
    {
      dialects: ['ABI', 'ONI'],
      pronunciation: '',
      word: 'ABI-word',
      editor: 'compare',
    },
    { dialects: ['ONI'], pronunciation: '', word: 'ONI-word' },
  ],
};
const compareData = {
  word: 'word',
  dialects: [
    {
      dialects: ['ABI', 'ONI'],
      pronunciation: '',
      word: 'ABI-word',
      editor: 'compare',
    },
  ],
};
describe('assignEditorsToDialects', () => {
  it('attributes the current user as the editor for the dialect with no compareData', () => {
    // @ts-expect-error
    assignEditorsToDialects({ clientData, compareData: null, userId: 'uid' }).dialects.forEach((dialect, index) => {
      expect(dialect.dialects).toBe(clientData.dialects[index].dialects);
      expect(dialect.pronunciation).toBe(clientData.dialects[index].pronunciation);
      expect(dialect.word).toBe(clientData.dialects[index].word);
      expect(dialect.editor).toBe('uid');
    });
  });

  // eslint-disable-next-line max-len
  it('attributes the current user as the editor for the new dialectal variation without editing the existing editor', () => {
    // @ts-expect-error
    const { dialects } = assignEditorsToDialects({ clientData, compareData, userId: 'uid' });
    expect(dialects[0].editor).toBe('compare');
    expect(dialects[1].editor).toBe('uid');
  });

  it('deletes a dialectal variation', () => {
    // @ts-expect-error
    const { dialects } = assignEditorsToDialects({ clientData: compareData, compareData: clientData, userId: 'uid' });
    expect(dialects).toHaveLength(1);
    expect(dialects[0].editor).toBe('compare');
  });
});
