import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import JoinIgboAPIProject from 'src/Core/Layout/components/AppBar/components/JoinIgboAPIProject';

describe('JoinIgboAPIProject', () => {
  it('renders join igbo api project', async () => {
    const { findByText } = render(
      <TestContext>
        <JoinIgboAPIProject />
      </TestContext>,
    );

    await findByText('Join Igbo API');
  });
});
