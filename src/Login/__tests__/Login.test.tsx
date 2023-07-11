import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import Login from '../Login';

describe('Login', () => {
  it('renders the left side and credential form', async () => {
    const { findByText, findByTestId } = render(
      <TestContext>
        <Login />
      </TestContext>,
    );
    await findByText('Building accessible Igbo technology for everyone.');
    await findByText('Create an account and join our volunteers to build the largest Igbo dataset ever.');
    await findByTestId('login-options');
  });
});
