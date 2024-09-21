import React from 'react';
import { render } from '@testing-library/react';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import OriginField from 'src/shared/components/OriginField';
import TestContext from 'src/__tests__/components/TestContext';
import { wordFixture } from 'src/__tests__/shared/fixtures';

describe('SourceField', () => {
  it('renders community field', async () => {
    const { findByText } = render(
      <TestContext>
        <OriginField record={wordFixture({ origin: SuggestionSourceEnum.COMMUNITY })} source="origin" />
      </TestContext>,
    );

    await findByText('Nkọwa okwu');
  });

  it('renders igbospeech field', async () => {
    const { findByText } = render(
      <TestContext>
        <OriginField record={wordFixture({ origin: SuggestionSourceEnum.IGBO_SPEECH })} source="origin" />
      </TestContext>,
    );

    await findByText('IgboSpeech');
  });

  it('renders igbo api editor field', async () => {
    const { findByText } = render(
      <TestContext>
        <OriginField record={wordFixture({ origin: SuggestionSourceEnum.INTERNAL })} source="origin" />
      </TestContext>,
    );

    await findByText('Igbo API Editor');
  });
});
