import React from 'react';
import { render, configure } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import Collections from 'src/shared/constants/Collection';
import Select from '../Select';

configure({ testIdAttribute: 'data-test' });

describe("Editor's Actions", () => {
  describe('Render Dropdown Menu', () => {
    beforeEach(() => {
      document.getElementsByTagName('html')[0].innerHTML = '';
    });
    it('render the select dropdown menu', async () => {
      const { findByLabelText } = render(
        <TestContext>
          <Select />
        </TestContext>,
      );

      await findByLabelText('Actions menu');
    });

    it('show all select options for words as editor', async () => {
      const { findByLabelText, findByText } = render(
        <TestContext>
          <Select resource={Collections.WORDS} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);

      await findByText('Copy Document URL');
    });

    it('show all select options for words as admin', async () => {
      const { findByLabelText, findByText } = render(
        <TestContext>
          <Select permissions={{ role: UserRoles.ADMIN }} resource={Collections.WORDS} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);

      await findByText('Combine Word Into...');
      await findByText('Request to Delete Word');
      await findByText('Copy Document URL');
    });

    it('show all select options for word suggestions as editor', async () => {
      const { findByLabelText, findByText, queryByText } = render(
        <TestContext>
          <Select resource={Collections.WORD_SUGGESTIONS} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);
      expect(await queryByText('Finalize')).toBeNull();
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Copy Document URL');
    });

    it('show all select options for word suggestions as merger', async () => {
      const { findByLabelText, findByText } = render(
        <TestContext>
          <Select permissions={{ role: UserRoles.MERGER }} resource={Collections.WORD_SUGGESTIONS} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);
      await findByText('Finalize');
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Delete');
      await findByText('Copy Document URL');
    });

    it('show all select options for corpora as editor', async () => {
      const { findByLabelText, findByText } = render(
        <TestContext>
          <Select resource={Collections.CORPORA} />
        </TestContext>,
      );
      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);

      await findByText('Copy Document URL');
    });

    it('show all select options for corpora as admin', async () => {
      const { findByLabelText, findByText } = render(
        <TestContext>
          <Select permissions={{ role: UserRoles.ADMIN }} resource={Collections.CORPORA} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);

      await findByText('Request to Delete Corpus');
      await findByText('Copy Document URL');
    });

    it('show all select options for corpus suggestions as editor', async () => {
      const { findByLabelText, findByText, queryByText } = render(
        <TestContext>
          <Select resource={Collections.CORPUS_SUGGESTIONS} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);
      expect(await queryByText('Finalize')).toBeNull();
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Copy Document URL');
    });

    it('show all select options for corpus suggestions as merger', async () => {
      const { findByLabelText, findByText } = render(
        <TestContext>
          <Select permissions={{ role: UserRoles.MERGER }} resource={Collections.CORPUS_SUGGESTIONS} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);
      await findByText('Finalize');
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Delete');
      await findByText('Copy Document URL');
    });

    it('show all select options for examples as editor', async () => {
      const { findByLabelText, queryByText, findByText } = render(
        <TestContext>
          <Select resource={Collections.EXAMPLES} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);

      expect(await queryByText('Request to Delete Example')).toBeNull();
      await findByText('Copy Document URL');
    });

    it('show all select options for example suggestions as editor', async () => {
      const { findByLabelText, findByText, queryByText } = render(
        <TestContext>
          <Select resource={Collections.WORD_SUGGESTIONS} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);
      expect(await queryByText('Finalize')).toBeNull();
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Copy Document URL');
    });

    it('show all select options for example suggestions as merger', async () => {
      const { findByLabelText, findByText } = render(
        <TestContext>
          <Select permissions={{ role: UserRoles.MERGER }} resource={Collections.WORD_SUGGESTIONS} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);
      await findByText('Finalize');
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Delete');
      await findByText('Copy Document URL');
    });
  });

  describe('Conditional Options', () => {
    it('disable merge when not enough approvals are present as merger', async () => {
      const { findByLabelText, findByText } = render(
        <TestContext>
          <Select permissions={{ role: UserRoles.MERGER }} resource={Collections.WORD_SUGGESTIONS} />
        </TestContext>,
      );

      const selectMenu = await findByLabelText('Actions menu');
      await findByLabelText('View entry button');
      await findByLabelText('Edit entry button');

      userEvent.click(selectMenu);
      const mergeButton = await findByText('Finalize');
      expect(mergeButton.parentNode).toHaveProperty('disabled', true);
      await findByText('Approve');
      await findByText('Deny');
      await findByText('Delete');
      await findByText('Copy Document URL');
    });

    it('hide delete option for nsibidi characters as merger', async () => {
      const { findByLabelText, queryByText, findByText } = render(
        <TestContext>
          <Select permissions={{ role: UserRoles.MERGER }} resource={Collections.NSIBIDI_CHARACTERS} />
        </TestContext>,
      );

      await findByLabelText('Actions menu');

      expect(await queryByText(/Request to Delete/)).toBeNull();
      await findByText('Copy Document URL');
    });

    it('hide delete option for nsibidi characters as nsibidi merger', async () => {
      const { findByLabelText, queryByText, findByText } = render(
        <TestContext>
          <Select permissions={{ role: UserRoles.MERGER }} resource={Collections.NSIBIDI_CHARACTERS} />
        </TestContext>,
      );

      await findByLabelText('Actions menu');

      expect(await queryByText(/Request to Delete/)).toBeNull();
      await findByText('Copy Document URL');
    });
  });

  it('hide delete option for nsibidi characters as admin', async () => {
    const { findByLabelText, findByText } = render(
      <TestContext>
        <Select permissions={{ role: UserRoles.ADMIN }} resource={Collections.NSIBIDI_CHARACTERS} />
      </TestContext>,
    );

    await findByLabelText('Actions menu');

    await findByText(/Delete Nsịbịdị character/);
    await findByText('Copy Document URL');
  });
});
