import React from 'react';
import { render } from '@testing-library/react';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import SourceField from 'src/shared/components/SourceField';
import TestContext from 'src/__tests__/components/TestContext';
import { wordFixture } from 'src/__tests__/shared/fixtures';

describe('SourceField', () => {
  it('renders community field', async () => {
    const { findByText } = render(
      <TestContext>
        <SourceField record={wordFixture({ source: SuggestionSourceEnum.COMMUNITY })} source="source" />
      </TestContext>,
    );

    await findByText('Nkọwa okwu');
  });

  it('renders igbospeech field', async () => {
    const { findByText } = render(
      <TestContext>
        <SourceField record={wordFixture({ source: SuggestionSourceEnum.IGBO_SPEECH })} source="source" />
      </TestContext>,
    );

    await findByText('IgboSpeech');
  });

  it('renders igbo api editor field', async () => {
    const { findByText } = render(
      <TestContext>
        <SourceField record={wordFixture({ source: SuggestionSourceEnum.INTERNAL })} source="source" />
      </TestContext>,
    );

    await findByText('Igbo API Editor');
  });
});
