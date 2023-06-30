import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import CredentialsForm from '../CredentialsForm';

describe('CredentialsForm', () => {
  it('renders the entire login form', async () => {
    const { findByText, findByPlaceholderText } = render(
      <TestContext>
        <CredentialsForm />
      </TestContext>,
    );
    await findByText('Log in to your account');
    await findByText('Email address');
    await findByPlaceholderText('Email address');
    await findByText('Password');
    await findByPlaceholderText('Password');
    await findByText('Forgot password?');
    await findByText('Sign in');
    await findByText("Don't have an account?");
    await findByText('Create account');
    await findByText('Sign in with Google');
  });
});
