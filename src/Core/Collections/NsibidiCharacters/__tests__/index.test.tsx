import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import { NsibidiCharacterTitle } from '..';

describe('NsibidiCharacters index', () => {
  it('renders the Nsibidi character title', async () => {
    const { findByText } = render(
      <TestContext groupIndex={0}>
        <NsibidiCharacterTitle id="" record={{}} />
      </TestContext>,
    );

    await findByText('Nsịbịdị Character');
  });

  it('renders the Nsibidi character title with custom nsibidi', async () => {
    const { findByText } = render(
      <TestContext groupIndex={0}>
        <NsibidiCharacterTitle id="" record={{ nsibidi: 'testing-nsibidi' }} />
      </TestContext>,
    );

    await findByText('Nsịbịdị Character');
    await findByText('"testing-nsibidi"');
  });
});
