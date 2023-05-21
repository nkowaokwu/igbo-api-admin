import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('render the Igbo API Editor Platform', async () => {
    const { findByText } = render(
      <App />,
    );
    await findByText('Loading the page, please wait a moment');
  });
});
