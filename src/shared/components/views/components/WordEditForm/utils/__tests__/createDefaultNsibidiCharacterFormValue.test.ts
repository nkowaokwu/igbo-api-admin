import WordClass from 'src/backend/shared/constants/WordClass';
import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';
import createDefaultNsibidiCharacterFormValues from 'src/shared/components/views/components/WordEditForm/utils/createDefaultNsibidiCharacterFormValues';

describe('createDefaultNsibidiCharacterFormValues', () => {
  it('creates the correct default value', () => {
    const record = { id: '', nsibidi: 'nsibidi', wordClass: WordClassEnum.ADV };

    const defaultValue = createDefaultNsibidiCharacterFormValues(record);

    expect(defaultValue).toEqual({
      id: '',
      nsibidi: 'nsibidi',
      wordClass: {
        label: WordClass[WordClassEnum.ADV].label,
        value: WordClass[WordClassEnum.ADV].value,
      },
    });
  });
});
