// Guide on mocking dataProvider
// https://github.com/marmelab/react-admin/pull/6753/files
import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collection';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';
import { exampleSuggestionFixture } from 'src/__tests__/shared/fixtures';
import ExampleShow from '../ExampleShow';

describe('Example Show', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  const record = exampleSuggestionFixture({
    id: '123',
    originalExampleId: 'original-example-id',
    igbo: 'first igbo example',
    english: 'first english example',
    pronunciations: [
      {
        _id: 'pronunciation-123',
        audio: 'first',
        speaker: AUTH_TOKEN.ADMIN_AUTH_TOKEN,
        archived: false,
        approvals: [AUTH_TOKEN.ADMIN_AUTH_TOKEN, AUTH_TOKEN.MERGER_AUTH_TOKEN],
        denials: [AUTH_TOKEN.EDITOR_AUTH_TOKEN],
        review: false,
      },
    ],
  });

  it('render all fields for examples', async () => {
    const dataProvider = {
      getOne: () =>
        Promise.resolve({
          data: record,
        }),
    };
    const { queryByText, findByText } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { examples: { data: {} } } } }}
        dataProvider={dataProvider}
        resource={Collections.EXAMPLES}
      >
        <ExampleShow basePath="/" id={record.id} />
      </TestContext>,
    );

    await findByText('Example Document Details');
    await findByText('Audio Pronunciations');
    await findByText('2 approvals');
    await findByText('1 denial');
    await findByText('Igbo');
    await findByText('first igbo example');
    await findByText('first english example');
    await findByText('English');
    await findByText('Nsịbịdị');
    await findByText('Associated Words');
    expect(await queryByText("Editor's Note")).toBeNull();
    expect(await queryByText("User's comments")).toBeNull();
  });

  it('render all fields for example suggestions', async () => {
    const dataProvider = {
      getOne: () =>
        Promise.resolve({
          data: record,
        }),
    };

    const { findByText } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { exampleSuggestions: { data: record } } } }}
        dataProvider={dataProvider}
        record={record}
        resource={Collections.EXAMPLE_SUGGESTIONS}
      >
        <ExampleShow basePath="/" id={record.id} />
      </TestContext>,
    );

    await findByText('Example Suggestion Document Details');
    await findByText('Audio Pronunciations');
    await findByText('Igbo');
    await findByText('first igbo example');
    await findByText('first english example');
    await findByText('English');
    await findByText('Associated Words');
    await findByText("Editor's Note");
    await findByText("User's comments");
  });
});
