import isEligibleTranslation from 'src/backend/controllers/exampleSuggestions/helpers/validation/isEligibleTranslation';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';

describe('Eligible Translation', () => {
  it('verifies the translation', () => {
    const uid = 'uid';
    const translation = {
      text: 'translation',
      authorId: uid,
      approvals: [],
      denials: [],
      language: LanguageEnum.IGBO,
      pronunciations: [],
    };
    expect(isEligibleTranslation({ translation, uid })).toEqual(true);
  });

  it('verifies the translation - no denials', () => {
    const uid = 'uid';
    const translation = {
      text: 'translation',
      authorId: uid,
      approvals: [],
      language: LanguageEnum.IGBO,
      pronunciations: [],
    };
    // @ts-expect-error
    expect(isEligibleTranslation({ translation, uid })).toEqual(true);
  });

  it('verifies the translation - no approvals', () => {
    const uid = 'uid';
    const translation = {
      text: 'translation',
      authorId: uid,
      approvals: [],
      language: LanguageEnum.IGBO,
      pronunciations: [],
    };
    // @ts-expect-error
    expect(isEligibleTranslation({ translation, uid })).toEqual(true);
  });

  it('verifies translation - no pronunciations', () => {
    const uid = 'uid';
    const translation = {
      text: 'translation',
      authorId: uid,
      approvals: [],
      denials: [],
      language: LanguageEnum.IGBO,
    };
    // @ts-expect-error
    expect(isEligibleTranslation({ translation, uid })).toEqual(true);
  });

  it('does not verify translation - authorId', () => {
    const uid = 'uid';
    const translation = {
      text: 'translation',
      approvals: [],
      denials: [],
      language: LanguageEnum.IGBO,
      pronunciations: [],
    };
    // @ts-expect-error
    expect(isEligibleTranslation({ translation, uid })).toEqual(false);
  });

  it('does not verify translation - language', () => {
    const uid = 'uid';
    const translation = {
      text: 'translation',
      authorId: uid,
      approvals: [],
      denials: [],
      language: 'testing',
      pronunciations: [],
    };
    // @ts-expect-error
    expect(isEligibleTranslation({ translation, uid })).toEqual(false);
  });
});
