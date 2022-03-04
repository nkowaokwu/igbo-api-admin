import React from 'react';
import { render, configure } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestContext } from 'ra-test';
import { Role } from 'src/shared/constants/auth-types';
import Collections from 'src/shared/constants/Collections';
import Select from '../Select';

configure({ testIdAttribute: 'data-test' });

describe('Render Select', () => {
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });
  it('render the select dropdown menu', () => {
    render(
      <TestContext>
        <Select />
      </TestContext>,
    );
  });

  it('show all select options for words as editor', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <Select resource={Collections.WORDS} />
      </TestContext>,
    );

    const selectMenu = await findByTestId(`select-menu-${Collections.WORDS}`);
    userEvent.click(selectMenu);
    await findByText('View');
    await findByText('Suggest New Edit');
    await findByText('Request to Delete Word');
  });

  it('show all select options for words as admin', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <Select
          permissions={{ role: Role.ADMIN }}
          resource={Collections.WORDS}
        />
      </TestContext>,
    );

    const selectMenu = await findByTestId(`select-menu-${Collections.WORDS}`);
    userEvent.click(selectMenu);
    await findByText('View');
    await findByText('Suggest New Edit');
    await findByText('Combine Word Into...');
    await findByText('Request to Delete Word');
  });

  it('show all select options for word suggestions as editor', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <Select resource={Collections.WORD_SUGGESTIONS} />
      </TestContext>,
    );

    const selectMenu = await findByTestId(
      `select-menu-${Collections.WORD_SUGGESTIONS}`,
    );
    userEvent.click(selectMenu);
    await findByText('Edit');
    await findByText('View');
    await findByText('Approve');
    await findByText('Deny');
  });

  it('show all select options for word suggestions as merger', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <Select
          permissions={{ role: Role.MERGER }}
          resource={Collections.WORD_SUGGESTIONS}
        />
      </TestContext>,
    );

    const selectMenu = await findByTestId(
      `select-menu-${Collections.WORD_SUGGESTIONS}`,
    );
    userEvent.click(selectMenu);
    await findByText('Merge');
    await findByText('Edit');
    await findByText('View');
    await findByText('Approve');
    await findByText('Deny');
    await findByText('Delete');
  });

  it('show all select options for examples as editor', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <Select resource={Collections.EXAMPLES} />
      </TestContext>,
    );

    const selectMenu = await findByTestId(`select-menu-${Collections.EXAMPLES}`);
    userEvent.click(selectMenu);
    await findByText('View');
    await findByText('Suggest New Edit');
    await findByText('Request to Delete Example');
  });

  it('show all select options for example suggestions as editor', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <Select resource={Collections.WORD_SUGGESTIONS} />
      </TestContext>,
    );

    const selectMenu = await findByTestId(
      `select-menu-${Collections.WORD_SUGGESTIONS}`,
    );
    userEvent.click(selectMenu);
    await findByText('Edit');
    await findByText('View');
    await findByText('Approve');
    await findByText('Deny');
  });

  it('show all select options for example suggestions as merger', async () => {
    const { findByTestId, findByText } = render(
      <TestContext>
        <Select
          permissions={{ role: Role.MERGER }}
          resource={Collections.WORD_SUGGESTIONS}
        />
      </TestContext>,
    );

    const selectMenu = await findByTestId(
      `select-menu-${Collections.WORD_SUGGESTIONS}`,
    );
    userEvent.click(selectMenu);
    await findByText('Merge');
    await findByText('Edit');
    await findByText('View');
    await findByText('Approve');
    await findByText('Deny');
    await findByText('Delete');
  });
});
