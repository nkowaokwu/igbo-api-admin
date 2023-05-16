import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import RelatedTermsForm from '../RelatedTermsForm';

describe('RelatedTermsForm', () => {
  it('renders the related terms', async () => {
    const { findByText, findByPlaceholderText } = render(
      <TestContext groupIndex={0}>
        <RelatedTermsForm />
      </TestContext>,
    );
    await findByText('Related Terms');
    await findByPlaceholderText('Search for a related term or use word id');
    await findByText('No related terms');
  });
});
