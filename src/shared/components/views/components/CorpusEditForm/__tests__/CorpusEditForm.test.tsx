import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';

import Collections from 'src/shared/constants/Collections';
import Views from 'src/shared/constants/Views';
import CorpusEditForm from '../CorpusEditForm';

describe('Corpus Edit', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });
  it('render corpus edit form', async () => {
    const { findByText } = render(
      <TestContext>
        <CorpusEditForm
          view={Views.EDIT}
          resource={Collections.CORPUS_SUGGESTIONS}
          record={{ id: '123' }}
          save={() => {}}
          history={{}}
        />
      </TestContext>,
    );
    await findByText('Title');
    await findByText('Editor\'s Comments');
  });

  it('enter values in corpus edit form', async () => {
    const { findByPlaceholderText, findByTestId } = render(
      <TestContext>
        <CorpusEditForm
          view={Views.EDIT}
          resource={Collections.CORPUS_SUGGESTIONS}
          record={{ id: '123' }}
          save={() => {}}
          history={{}}
        />
      </TestContext>,
    );

    userEvent.type(await findByPlaceholderText('Title of corpus'), 'Corpus Title');
    userEvent.type(await findByTestId('transcript-input'), 'Corpus transcript');
  });
});
