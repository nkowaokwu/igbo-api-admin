import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import DataDump from '../DataDump';

describe('Data Dump', () => {
  it('render the textarea field', async () => {
    const { findByTestId } = render(
      <TestContext>
        <DataDump />
      </TestContext>,
    );
    await findByTestId('data-dump-textarea');
  });

  it('should count all example sentences in textarea', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <DataDump />
      </TestContext>,
    );
    userEvent.type(await findByTestId('data-dump-textarea'), 'First sentence\nSecond sentence\nThird sentence');
    await findByText('0 / 3');
  });

  it('render the confirmation modal with example sentence count', async () => {
    const { findByTestId, findByRole } = render(
      <TestContext>
        <DataDump />
      </TestContext>,
    );
    const uploadButton = await findByRole('button', { name: 'Bulk upload sentences' });
    // @ts-expect-error disabled
    expect(uploadButton.disabled).toBeTruthy();
    userEvent.type(await findByTestId('data-dump-textarea'), 'First sentence\nSecond sentence\nThird sentence');
    userEvent.click(uploadButton);
    await findByTestId('confirmation-cancel-button');
    await findByTestId('confirmation-confirm-button');
  });
});
