// Guide on mocking dataProvider
// https://github.com/marmelab/react-admin/pull/6753/files
import React from 'react';
import { render, configure } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import Collections from 'src/shared/constants/Collections';
import CorpusShow from '../CorpusShow';

configure({ testIdAttribute: 'data-test' });

const record = {
  id: 123,
  title: 'Corpus title',
  body: 'Corpus body',
  media: '',
  tags: [],
};

const dataProvider = {
  getOne: () => Promise.resolve({
    data: record,
  }),
};

describe('Corpus Show', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
    dataProvider.getOne = () => Promise.resolve({
      data: record,
    });
  });

  it('render all fields for corpora', async () => {
    const { queryByText, findByText } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { corpora: { data: {} } } } }}
        dataProvider={dataProvider}
      >
        <CorpusShow basePath="/" resource={Collections.CORPORA} id={record.id} />
      </TestContext>,
    );

    await findByText('Corpus Document Details');
    await findByText('Title');
    await findByText('Body');
    await findByText('Media');
    expect(await queryByText('Editor\'s Note')).toBeNull();
  });

  it('render all fields for corpus suggestions', async () => {
    const { findByText } = render(
      <TestContext
        enableReducers
        initialState={{ admin: { resources: { corpusSuggestions: { data: {} } } } }}
        dataProvider={dataProvider}
      >
        <CorpusShow basePath="/" resource={Collections.CORPUS_SUGGESTIONS} id={record.id} />
      </TestContext>,
    );

    await findByText('Corpus Suggestion Document Details');
    await findByText('Title');
    await findByText('Body');
    await findByText('Media');
    await findByText('Editor\'s Note');
  });
});
