import React from 'react';
import { render } from '@testing-library/react';
import CredentialsForm from '../CredentialsForm';

describe('CredentialsForm', () => {
  it('renders the entire login form', async () => {
    const { findByText, findByPlaceholderText } = render(
      <CredentialsForm />,
    );
    await findByText('Email address');
    await findByPlaceholderText('Email address');
    await findByText('Password');
    await findByPlaceholderText('Password');
    await findByText('Forgot password?');
    await findByText('Sign in');
    await findByText('Don\'t have an account?');
    await findByText('Create account');
    await findByText('Sign in with Google');
  });
});
