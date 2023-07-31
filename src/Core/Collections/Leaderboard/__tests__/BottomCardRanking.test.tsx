import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import BottomCardRanking from '../BottomCardRanking';

describe('BottomCardRanking', () => {
  it('render the bottom card ranking', async () => {
    const { findByText, findByLabelText } = render(
      <TestContext groupIndex={0}>
        <BottomCardRanking displayName="Ijemma Onwuzulike" photoURL="" count={100} position={10} />
      </TestContext>,
    );
    await findByLabelText('Ijemma Onwuzulike');
    await findByText('100 points');
    await findByText('10.');
  });
});
