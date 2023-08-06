import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import TermsAndPrivacyMessage from '../components/TermsAndPrivacyMessage';

describe('TermsAndPrivacyMessage', () => {
  it('renders the terms and privacy message', async () => {
    const { findByText } = render(
      <TestContext>
        <TermsAndPrivacyMessage />
      </TestContext>,
    );

    await findByText(/By creating an account/);
  });

  it('renders the error message', async () => {
    const { findByText } = render(
      <TestContext>
        <TermsAndPrivacyMessage errorMessage="errorMessage" />
      </TestContext>,
    );

    await findByText('errorMessage');
  });
});
