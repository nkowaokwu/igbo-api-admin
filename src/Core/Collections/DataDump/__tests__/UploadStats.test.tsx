// Testing react-select dropdown: https://stackoverflow.com/a/61551935
import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import UploadStats from '../UploadStats';

describe('UploadStats', () => {
  it('render the success and failure messages', async () => {
    const statuses = [{ success: true }, { success: true }, { success: false }];
    const { findByText } = render(
      <TestContext>
        {/* @ts-expect-error */}
        <UploadStats statuses={statuses} />
      </TestContext>,
    );

    await findByText('2 Succeeded');
    await findByText('1 Failed');
  });
});
