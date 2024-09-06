import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import IgboSoundbox from '../IgboSoundbox';

describe('IgboSoundbox', () => {
  it('render IgboSoundbox homepage', async () => {
    render(
      <TestContext>
        <IgboSoundbox />
      </TestContext>,
    );
  });
});
