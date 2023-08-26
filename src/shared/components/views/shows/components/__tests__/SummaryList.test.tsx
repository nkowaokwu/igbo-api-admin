import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import SummaryList from '../SummaryList';

describe('SummaryList', () => {
  it('renders the summary list', async () => {
    const items = [
      { title: 'first-title', description: 'first-description' },
      { title: 'second-title', description: 'second-description' },
    ];
    const title = 'Testing title';
    const { findByText, findByRole } = render(
      <TestContext>
        <SummaryList
          items={items}
          title={title}
          render={(archivedExample, archivedExampleIndex) => (
            <>
              <Text color="gray.600" mr={3}>{`${archivedExampleIndex + 1}.`}</Text>
              <Box>
                <Text>{archivedExample.title}</Text>
                <Text>{archivedExample.description}</Text>
              </Box>
            </>
          )}
        />
      </TestContext>,
    );
    await findByText(title);
    userEvent.click(await findByRole('menubar'));
    await findByText(items[0].title);
    await findByText(items[0].description);
    await findByText(items[1].title);
    await findByText(items[1].description);
  });
});
