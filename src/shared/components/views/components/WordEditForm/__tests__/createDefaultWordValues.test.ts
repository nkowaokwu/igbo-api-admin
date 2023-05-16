import { cloneDeep } from 'lodash';
import { wordRecord } from 'src/__tests__/__mocks__/documentData';
import createDefaultWordFormValues from '../utils/createDefaultWordFormValues';

describe('WordEditForm utils', () => {
  it('creates a default word form value', () => {
    const staticWordRecord = cloneDeep(wordRecord);
    // @ts-expect-error
    const defaultValues = createDefaultWordFormValues(staticWordRecord);

    expect(defaultValues.definitions[0].wordClass.value).toEqual('AV');
    expect(defaultValues.definitions[0].wordClass.label).toEqual('Active verb');
    expect(defaultValues.definitions[0].definitions[0].text).toEqual('first definition');
    expect(defaultValues.definitions[0].nsibidi).toEqual('first nsibidi');
    expect(defaultValues.examples).toHaveLength(0);
    expect(defaultValues.stems).toHaveLength(0);
    expect(defaultValues.relatedTerms).toHaveLength(0);
    expect(defaultValues.pronunciation).toEqual('');
  });
});
