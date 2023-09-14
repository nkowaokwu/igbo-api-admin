import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import * as reactAdmin from 'react-admin';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import Card from '../Card';

describe('Card', () => {
  it('render card with text', async () => {
    const text = 'Testing text';
    const { findByText, queryByTestId } = render(
      <TestContext>
        <Card text={text} />
      </TestContext>,
    );
    await findByText(text);
    expect(await queryByTestId('card-link')).toBeNull();
  });

  it('render card with text with link as admin', async () => {
    jest.spyOn(reactAdmin, 'usePermissions').mockReturnValue({ permissions: { role: UserRoles.ADMIN } });

    const text = 'Testing text';
    const href = 'href';
    const { findByText, findByTestId } = render(
      <TestContext>
        <Card text={text} href={href} />
      </TestContext>,
    );
    await findByText(text);
    await findByText('View resource');
    await findByTestId('card-link');
  });

  it('render card with text with link as crowdsourcer', async () => {
    jest.spyOn(reactAdmin, 'usePermissions').mockReturnValue({ permissions: { role: UserRoles.CROWDSOURCER } });

    const text = 'Testing text';
    const href = 'href';
    const { findByText, queryByTestId } = render(
      <TestContext>
        <Card text={text} href={href} />
      </TestContext>,
    );
    await findByText(text);
    await findByText('Copy resource link');
    await queryByTestId('card-link');
  });
});
