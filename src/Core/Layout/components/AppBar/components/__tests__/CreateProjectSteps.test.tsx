import React from 'react';
import { render } from '@testing-library/react';
import CreateProjectSteps from 'src/Core/Layout/components/AppBar/components/CreateProjectSteps';
import TestContext from 'src/__tests__/components/TestContext';

describe('CreateProjectSteps', () => {
  it('renders create project steps', async () => {
    const { findByText } = render(
      <TestContext>
        <CreateProjectSteps />
      </TestContext>,
    );

    await findByText("Let's create a new project");
    await findByText('Title');
    await findByText('Description');
    await findByText('Project types');
    await findByText('Languages');
    await findByText('License');
    await findByText('Create project');
  });
});
