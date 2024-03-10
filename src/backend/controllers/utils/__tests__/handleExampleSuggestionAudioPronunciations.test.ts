import { cloneDeep } from 'lodash';
import * as splitAudioUrl from 'src/backend/shared/utils/splitAudioUrl';
import handleExampleSuggestionAudioPronunciations from '../handleExampleSuggestionAudioPronunciations';
import * as AudioAPI from '../MediaAPIs/AudioAPI';

const staticDbExampleSuggestion = {
  id: 'testing-id',
  igbo: 'db igbo',
  english: 'db english',
  nsibidi: 'db nsibidi',
  exampleForSuggestion: false,
  pronunciations: [
    { audio: 'first audio', speaker: 'first speaker' },
    { audio: 'second audio', speaker: 'second speaker' },
  ],
};

const staticClientExampleSuggestion = {
  igbo: 'client igbo',
  english: 'client english',
  nsibidi: 'client nsibidi',
  pronunciations: [
    { audio: 'first audio', speaker: 'first speaker' },
    { audio: 'second audio', speaker: 'second speaker' },
  ],
};

describe('handleExampleSuggestionAudioPronunciations', () => {
  it('does not delete any pronunciations', () => {
    const dbExampleSuggestion = cloneDeep(staticDbExampleSuggestion);
    const clientExampleSuggestion = cloneDeep(staticClientExampleSuggestion);
    const mockDeleteAudioPronunciation = jest.spyOn(AudioAPI, 'deleteAudioPronunciation');
    const mockIsPronunciationMp3 = jest.spyOn(splitAudioUrl, 'isPronunciationMp3');
    const mockGetPronunciationId = jest.spyOn(splitAudioUrl, 'getPronunciationId');

    handleExampleSuggestionAudioPronunciations({
      // @ts-expect-error
      exampleSuggestion: dbExampleSuggestion,
      // @ts-expect-error
      data: clientExampleSuggestion,
    });

    expect(mockDeleteAudioPronunciation).not.toHaveBeenCalled();
    expect(mockIsPronunciationMp3).not.toHaveBeenCalled();
    expect(mockGetPronunciationId).not.toHaveBeenCalled();
  });

  it('deletes on pronunciation', () => {
    const dbExampleSuggestion = cloneDeep(staticDbExampleSuggestion);
    const clientExampleSuggestion = cloneDeep(staticClientExampleSuggestion);

    dbExampleSuggestion.pronunciations.push({ audio: 'db third audio', speaker: 'third speaker' });

    const mockDeleteAudioPronunciation = jest.spyOn(AudioAPI, 'deleteAudioPronunciation');
    const mockIsPronunciationMp3 = jest.spyOn(splitAudioUrl, 'isPronunciationMp3');
    const mockGetPronunciationId = jest.spyOn(splitAudioUrl, 'getPronunciationId');

    handleExampleSuggestionAudioPronunciations({
      // @ts-expect-error
      exampleSuggestion: dbExampleSuggestion,
      // @ts-expect-error
      data: clientExampleSuggestion,
    });

    expect(mockDeleteAudioPronunciation).toHaveBeenCalled();
    expect(mockIsPronunciationMp3).toHaveBeenCalledWith('db third audio');
    expect(mockGetPronunciationId).toHaveBeenCalledWith('db third audio');
  });
  it('deletes all pronunciation', () => {
    const dbExampleSuggestion = cloneDeep(staticDbExampleSuggestion);
    const clientExampleSuggestion = cloneDeep(staticClientExampleSuggestion);

    dbExampleSuggestion.pronunciations[0] = { audio: 'db first audio', speaker: 'first speaker' };
    dbExampleSuggestion.pronunciations[1] = { audio: 'db second audio', speaker: 'second speaker' };
    dbExampleSuggestion.pronunciations[2] = { audio: 'db third audio', speaker: 'third speaker' };

    const mockDeleteAudioPronunciation = jest.spyOn(AudioAPI, 'deleteAudioPronunciation');
    const mockIsPronunciationMp3 = jest.spyOn(splitAudioUrl, 'isPronunciationMp3');
    const mockGetPronunciationId = jest.spyOn(splitAudioUrl, 'getPronunciationId');

    handleExampleSuggestionAudioPronunciations({
      // @ts-expect-error
      exampleSuggestion: dbExampleSuggestion,
      // @ts-expect-error
      data: clientExampleSuggestion,
    });

    expect(mockDeleteAudioPronunciation).toHaveBeenCalled();
    expect(mockIsPronunciationMp3).toHaveBeenCalledWith('db first audio');
    expect(mockIsPronunciationMp3).toHaveBeenCalledWith('db second audio');
    expect(mockIsPronunciationMp3).toHaveBeenCalledWith('db third audio');
    expect(mockGetPronunciationId).toHaveBeenCalledWith('db first audio');
    expect(mockGetPronunciationId).toHaveBeenCalledWith('db second audio');
    expect(mockGetPronunciationId).toHaveBeenCalledWith('db third audio');
  });
});
