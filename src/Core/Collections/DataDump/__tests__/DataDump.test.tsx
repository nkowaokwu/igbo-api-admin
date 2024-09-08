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

  it('render more data dump options', async () => {
    const { findByText, findByTestId } = render(
      <TestContext>
        <DataDump />
      </TestContext>,
    );
    userEvent.click(await findByText('More data upload options'));
    await findByText('Select a JSON or CSV file to bulk upload example sentences.');
    await findByText('These sentences will become example suggestions.');
    await findByText('The digital origin the text originated from');
    await findByText('The type of sentence');
    await findByTestId('suggestion-origin-dropdown');
    await findByTestId('sentence-type-dropdown');
  });
});
