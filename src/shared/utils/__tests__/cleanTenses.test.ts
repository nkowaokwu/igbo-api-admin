import { assign } from 'lodash';
import cleanTenses from '../cleanTenses';
import { wordFixture } from '../../../__tests__/shared/fixtures/wordFixtures';
import TenseEnum from '../../../backend/shared/constants/TenseEnum';

describe('cleanTenses', () => {
  it('replaces falsely values with empty string', () => {
    const word = assign(
      wordFixture({
        tenses: {
          [TenseEnum.INFINITIVE]: null,
          [TenseEnum.IMPERATIVE]: undefined,
          // @ts-expect-error testing with invalid values
          [TenseEnum.SIMPLE_PAST]: 0,
          [TenseEnum.PRESENT_PASSIVE]: '',
          // @ts-expect-error testing with invalid values
          [TenseEnum.SIMPLE_PRESENT]: new Error('error'),
          [TenseEnum.PRESENT_CONTINUOUS]: 'presentContinuous',
          [TenseEnum.FUTURE]: 'future',
        },
      }),
    );
    expect(cleanTenses(word)).toMatchObject({
      tenses: {
        future: 'future',
        imperative: '',
        infinitive: '',
        presentContinuous: 'presentContinuous',
        presentPassive: '',
        simplePast: '',
        simplePresent: '',
      },
    });
  });
});
