import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import { nsibidiCharacterData } from 'src/__tests__/__mocks__/documentData';
import NsibidiCharacterResult from '../NsibidiCharacterResult';

const result = nsibidiCharacterData;

describe('NsibidiCharacterResult', () => {
  it('render the nsibidi characters results', async () => {
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
