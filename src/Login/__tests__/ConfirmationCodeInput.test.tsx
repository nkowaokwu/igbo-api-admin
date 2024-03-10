import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import userEvent from '@testing-library/user-event';
import ConfirmationCodeInput from '../components/ConfirmationCodeInput';

describe('ConfirmationCodeInput', () => {
  it('calls the onComplete mock when values pasted in', async () => {
    const onCompleteMock = jest.fn();
    const verificationCode = '123456';

    const { findByTestId } = render(
      <TestContext>
        <ConfirmationCodeInput onComplete={onCompleteMock} />
      </TestContext>,
    );
    userEvent.paste(await findByTestId('first-input-code-verification'), verificationCode);
    expect(onCompleteMock).toHaveBeenCalledWith(verificationCode);
  });
});
