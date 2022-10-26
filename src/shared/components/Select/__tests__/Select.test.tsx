import React from 'react';
import { render, configure } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import { Role } from 'src/shared/constants/auth-types';
import Collections from 'src/shared/constants/Collections';
import Select from '../Select';

configure({ testIdAttribute: 'data-test' });

describe('Editor\'s Actions', () => {
  describe('Render Dropdown Menu', () => {
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
      await findByText('Copy Document URL');
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
      await findByText('Copy Document URL');
    });

    it('show all select options for word suggestions as editor', async () => {
      const { findByTestId, findByText, queryByText } = render(
        <TestContext>
          <Select resource={Collections.WORD_SUGGESTIONS} />
        </TestContext>,
      );

      const selectMenu = await findByTestId(
        `select-menu-${Collections.WORD_SUGGESTIONS}`,
      );
      userEvent.click(selectMenu);
      expect(await queryByText('Merge')).toBeNull();
      await findByText('Edit');
      await findByText('View');
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Copy Document URL');
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
      await findByText('Copy Document URL');
    });

    it('show all select options for corpora as editor', async () => {
      const { findByTestId, findByText } = render(
        <TestContext>
          <Select resource={Collections.CORPORA} />
        </TestContext>,
      );

      const selectMenu = await findByTestId(`select-menu-${Collections.CORPORA}`);
      userEvent.click(selectMenu);
      await findByText('View');
      await findByText('Suggest New Edit');
      await findByText('Request to Delete Corpus');
      await findByText('Copy Document URL');
    });

    it('show all select options for corpora as admin', async () => {
      const { findByTestId, findByText } = render(
        <TestContext>
          <Select
            permissions={{ role: Role.ADMIN }}
            resource={Collections.CORPORA}
          />
        </TestContext>,
      );

      const selectMenu = await findByTestId(`select-menu-${Collections.CORPORA}`);
      userEvent.click(selectMenu);
      await findByText('View');
      await findByText('Suggest New Edit');
      await findByText('Request to Delete Corpus');
      await findByText('Copy Document URL');
    });

    it('show all select options for corpus suggestions as editor', async () => {
      const { findByTestId, findByText, queryByText } = render(
        <TestContext>
          <Select resource={Collections.CORPUS_SUGGESTIONS} />
        </TestContext>,
      );

      const selectMenu = await findByTestId(
        `select-menu-${Collections.CORPUS_SUGGESTIONS}`,
      );
      userEvent.click(selectMenu);
      expect(await queryByText('Merge')).toBeNull();
      await findByText('Edit');
      await findByText('View');
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Copy Document URL');
    });

    it('show all select options for corpus suggestions as merger', async () => {
      const { findByTestId, findByText } = render(
        <TestContext>
          <Select
            permissions={{ role: Role.MERGER }}
            resource={Collections.CORPUS_SUGGESTIONS}
          />
        </TestContext>,
      );

      const selectMenu = await findByTestId(
        `select-menu-${Collections.CORPUS_SUGGESTIONS}`,
      );
      userEvent.click(selectMenu);
      await findByText('Merge');
      await findByText('Edit');
      await findByText('View');
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Delete');
      await findByText('Copy Document URL');
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
      await findByText('Copy Document URL');
    });

    it('show all select options for example suggestions as editor', async () => {
      const { findByTestId, findByText, queryByText } = render(
        <TestContext>
          <Select resource={Collections.WORD_SUGGESTIONS} />
        </TestContext>,
      );

      const selectMenu = await findByTestId(
        `select-menu-${Collections.WORD_SUGGESTIONS}`,
      );
      userEvent.click(selectMenu);
      expect(await queryByText('Merge')).toBeNull();
      await findByText('Edit');
      await findByText('View');
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Copy Document URL');
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
      await findByText('Copy Document URL');
    });
  });

  describe('Conditional Options', () => {
    it('disable merge when not enough approvals are present as merger', async () => {
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
      const mergeButton = await findByText('Merge');
      expect(mergeButton.parentNode).toHaveProperty('disabled', true);
      await findByText('Edit');
      await findByText('View');
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Delete');
      await findByText('Copy Document URL');
    });
  });
});
