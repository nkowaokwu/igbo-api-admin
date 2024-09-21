import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import DataDump from '../DataDump';

describe('Data Dump', () => {
  it('render the textarea field', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <DataDump />
      </TestContext>,
    );
    await findByTestId('data-dump-textarea');
    userEvent.click(await findByText('Upload sentences'));
    await findByText(
      // eslint-disable-next-line max-len
      'Upload a new-line separated text file or copy and paste your text. Each line will be uploaded as a uniqueExample sentence',
    );
  });
});
