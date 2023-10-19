import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';
import CharacterAttributesForm from '../CharacterAttributesForm';

describe('CharacterAttributesForm', () => {
  it('render the character attribute options', async () => {
    const getValuesMock = jest.fn(() => ({
      attributes: {
        [NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS]: false,
        [NsibidiCharacterAttributeEnum.IS_RADICAL]: false,
      },
    }));
    const { findByText } = render(
      <TestContext>
        <CharacterAttributesForm record={{}} getValues={getValuesMock} />
      </TestContext>,
    );

    await findByText('Has Legacy Characters');
    await findByText('Is Compound');
    await findByText('Is Simplified');
    await findByText('Is New');
    await findByText('Is Radical');
  });

  it('render the character attribute options with default values', async () => {
    const getValuesMock = jest.fn(() => ({
      attributes: {
        [NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS]: true,
        [NsibidiCharacterAttributeEnum.IS_RADICAL]: true,
      },
    }));
    const { findByTestId } = render(
      <TestContext>
        <CharacterAttributesForm record={{}} getValues={getValuesMock} />
      </TestContext>,
    );

    const hasLegacyCharactersCheckboxLabel = await findByTestId(
      `${NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS}-checkbox`,
    );
    const isRadicalCheckboxLabel = await findByTestId(`${NsibidiCharacterAttributeEnum.IS_RADICAL}-checkbox`);
    expect(hasLegacyCharactersCheckboxLabel.hasAttribute('data-checked')).toBeTruthy();
    expect(isRadicalCheckboxLabel.hasAttribute('data-checked')).toBeTruthy();
  });
});
