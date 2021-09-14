interface MoveAudioPronunciation {
  fromDialect: string,
  pronunciation: { string: string },
  setPronunciation: (key: string, value: any) => void,
  updateSelectedDialects: (value: string) => void,
};

export default MoveAudioPronunciation;
