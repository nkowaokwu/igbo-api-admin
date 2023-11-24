import isEligibleAudioPronunciation from 'src/backend/controllers/exampleSuggestions/helpers/validation/isEligibleAudioPronunciation';

describe('Eligible Audio Pronunciation', () => {
  it('verifies the audio pronunciation', () => {
    const uid = 'uid';
    const pronunciation = {
      denials: [],
      audio: 'http://',
      speaker: uid,
      review: true,
      approvals: [],
      archived: false,
    };
    expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(true);
  });

  it('does not verify audio pronunciation - denials', () => {
    const uid = 'uid';
    const pronunciation = {
      denials: ['uid-1', 'uid-3'],
      audio: 'http://',
      speaker: uid,
      review: true,
      approvals: ['uid', 'uid-2'],
      archived: false,
    };
    expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(false);
  });

  it('does not verify audio pronunciation - audio', () => {
    const uid = 'uid';
    const pronunciation = {
      denials: ['uid-1'],
      audio: '',
      speaker: uid,
      review: true,
      approvals: ['uid', 'uid-2'],
      archived: false,
    };
    expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(false);
  });

  it('does not verify audio pronunciation - speaker', () => {
    const uid = 'uid';
    const pronunciation = {
      denials: ['uid-1'],
      audio: 'https://',
      speaker: 'uid-1',
      review: true,
      approvals: ['uid', 'uid-2'],
      archived: false,
    };
    expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(false);
  });

  it('does not verify audio pronunciation - review', () => {
    const uid = 'uid';
    const pronunciation = {
      denials: ['uid-1'],
      audio: 'https://',
      speaker: uid,
      review: false,
      approvals: ['uid', 'uid-2'],
      archived: false,
    };
    expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(false);
  });

  it('does not verify audio pronunciation - archived', () => {
    const uid = 'uid';
    const pronunciation = {
      denials: ['uid-1'],
      audio: 'https://',
      speaker: uid,
      review: false,
      approvals: ['uid', 'uid-2'],
      archived: true,
    };
    expect(isEligibleAudioPronunciation({ pronunciation, uid })).toEqual(false);
  });
});
