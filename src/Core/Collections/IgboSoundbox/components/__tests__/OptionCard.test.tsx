import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import OptionCard from '../OptionCard';

describe('OptionCard', () => {
  it('render the option card', async () => {
    const title = 'Test goal';
    const icon = '';
    const description = 'This is a goal description';
    const link = '';
    const mockButtonClick = jest.fn();
    const currentStat = 1000;
    const tooltipLabel = 'Tooltip label';
    const { findByText } = render(
      <TestContext index={0}>
        <OptionCard
          title={title}
          icon={icon}
          description={description}
          link={link}
          onButtonClick={mockButtonClick}
          currentStat={currentStat}
          tooltipLabel={tooltipLabel}
        />
      </TestContext>,
    );
    await findByText(title);
    await findByText(description);
    await findByText('Your next milestone goal is 2,000');
  });

  it('automatically increases the milestone goal amount', async () => {
    const title = 'Test goal';
    const icon = '';
    const description = 'This is a goal description';
    const link = '';
    const mockButtonClick = jest.fn();
    const currentStat = 6000;
    const tooltipLabel = 'Tooltip label';
    const { findByText } = render(
      <TestContext index={0}>
        <OptionCard
          title={title}
          icon={icon}
          description={description}
          link={link}
          onButtonClick={mockButtonClick}
          currentStat={currentStat}
          tooltipLabel={tooltipLabel}
        />
      </TestContext>,
    );
    await findByText(title);
    await findByText(description);
    await findByText('Your next milestone goal is 8,000');
  });
});
