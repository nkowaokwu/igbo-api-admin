import { wordFixture } from 'src/__tests__/shared/fixtures';
import createDefaultWordFormValues from '../utils/createDefaultWordFormValues';

describe('WordEditForm utils', () => {
  it('creates a default word form value', () => {
    const word = wordFixture();
    const defaultValues = createDefaultWordFormValues(word);

    expect(defaultValues.definitions[0].wordClass.value).toEqual('AV');
    expect(defaultValues.definitions[0].wordClass.label).toEqual('Active verb');
    expect(defaultValues.definitions[0].definitions[0].text).toEqual('first definition');
    expect(defaultValues.definitions[0].nsibidi).toEqual('first nsibidi');
    expect(defaultValues.examples).toHaveLength(1);
    expect(defaultValues.stems).toHaveLength(0);
    expect(defaultValues.relatedTerms).toHaveLength(0);
    expect(defaultValues.pronunciation).toEqual('');
    expect(defaultValues.examples[0]).toHaveProperty('exampleId');
  });
});
