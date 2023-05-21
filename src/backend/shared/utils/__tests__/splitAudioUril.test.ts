import { isPronunciationMp3, getPronunciationId } from '../splitAudioUrl';

describe('splitAudioUrl', () => {
  it('validates the url is an mp3', () => {
    expect(isPronunciationMp3('audio.mp3')).toBe(true);
  });

  it('validates the url is not an mp3', () => {
    expect(isPronunciationMp3('audio.mp4')).toBe(false);
  });

  it('gets the id from the audio url including mp3', () => {
    const audioId = 'audioId';
    const url = `https://aws.com/directory/${audioId}.mp3`;
    expect(getPronunciationId(url)).toEqual(audioId);
  });

  it('gets the id from the audio url including webm', () => {
    const audioId = 'audioId';
    const url = `https://aws.com/directory/${audioId}.webm`;
    expect(getPronunciationId(url)).toEqual(audioId);
  });
});
