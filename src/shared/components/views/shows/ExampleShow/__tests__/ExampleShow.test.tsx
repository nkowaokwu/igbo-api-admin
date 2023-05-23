// Guide on mocking dataProvider
// https://github.com/marmelab/react-admin/pull/6753/files
import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collections';
import ExampleShow from '../ExampleShow';

describe('Example Show', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  const record = {
    id: 123,
    igbo: 'first igbo example',
    english: 'first english example',
  };

  it('render all fields for examples', async () => {
    const dataProvider = {
      getOne: () => Promise.resolve({
        data: record,
      }),
    };
    const { queryByText, findByText } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { examples: { data: {} } } } }}
        dataProvider={dataProvider}
      >
        <ExampleShow basePath="/" resource={Collections.EXAMPLES} id={record.id} />
      </TestContext>,
    );

    await findByText('Example Document Details');
    await findByText('Audio Pronunciations');
    await findByText('Igbo');
    await findByText('first igbo example');
    await findByText('first english example');
    await findByText('English');
    await findByText('Nsịbịdị');
    await findByText('Associated Words');
    expect(await queryByText('Editor\'s Note')).toBeNull();
    expect(await queryByText('User\'s comments')).toBeNull();
  });

  it('render all fields for example suggestions', async () => {
    const dataProvider = {
      getOne: () => Promise.resolve({
        data: record,
      }),
    };
    const { findByText } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { exampleSuggestions: { data: record } } } }}
        dataProvider={dataProvider}
      >
        <ExampleShow basePath="/" resource={Collections.EXAMPLE_SUGGESTIONS} id={record.id} />
      </TestContext>,
    );

    await findByText('Example Suggestion Document Details');
    await findByText('Audio Pronunciations');
    await findByText('Igbo');
    await findByText('first igbo example');
    await findByText('first english example');
    await findByText('English');
    await findByText('Associated Words');
    await findByText('Editor\'s Note');
    await findByText('User\'s comments');
  });
});
