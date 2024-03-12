import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import { nsibidiCharacterFixture } from 'src/__tests__/shared/fixtures';
import NsibidiCharacterResult from '../NsibidiCharacterResult';

describe('NsibidiCharacterResult', () => {
  it('render the nsibidi characters results', async () => {
    const result = nsibidiCharacterFixture({
      nsibidi: 'nsibidi',
      pronunciation: 'testing',
      definitions: [{ text: 'first definition' }],
    });
    const { findByText } = render(
      <TestContext>
        <NsibidiCharacterResult result={result} />
      </TestContext>,
    );

    await findByText(result.nsibidi);
    await findByText(result.pronunciation);
    await findByText(result.definitions[0].text);
  });
});
