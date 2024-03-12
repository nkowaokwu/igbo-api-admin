// Testing react-select dropdown: https://stackoverflow.com/a/61551935
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import Dialects from 'src/backend/shared/constants/Dialect';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import CurrentDialectsForms from '../CurrentDialectsForms';

describe('CurrentDialectsForms', () => {
  it('render the current dialects form', async () => {
    const { findByText, findAllByText } = render(
      <TestContext>
        <CurrentDialectsForms />
      </TestContext>,
    );

    await findByText('Dialectal Variations');
    await findAllByText('Word');
    await findAllByText('Dialects');
    await findAllByText('Add Dialectal Variation');
    await findAllByText(Dialects.ABI.label);
  });

  it('adds another dialectal variation', async () => {
    const { getByText, findByTestId } = render(
      <TestContext>
        <CurrentDialectsForms />
      </TestContext>,
    );

    const dialectsSelect = await findByTestId('dialects-input-container-0');
    fireEvent.keyDown(dialectsSelect.firstChild, { key: 'ArrowDown' });

    Object.values(Dialects).forEach(({ label }) => {
      getByText(label);
    });
  });

  it('handles adding a selected dialect', async () => {
    const mockOnChange = jest.fn();

    const { findByText, findByTestId } = render(
      <TestContext>
        <CurrentDialectsForms setDialects={mockOnChange} />
      </TestContext>,
    );
    const dialectsSelect = await findByTestId('dialects-input-container-0');
    fireEvent.keyDown(dialectsSelect.firstChild, { key: 'ArrowDown' });
    fireEvent.click(await findByText(Dialects.AJA.label));
    expect(mockOnChange).toHaveBeenCalledWith([
      {
        dialects: [DialectEnum.ABI, DialectEnum.AJA],
        id: 'dialect-id',
        word: 'word',
        pronunciation: '',
        variations: [],
      },
    ]);
  });

  it('handles removing a selected dialect', async () => {
    const mockOnChange = jest.fn();
    const { findByText, findByTestId } = render(
      <TestContext>
        <CurrentDialectsForms setDialects={mockOnChange} />
      </TestContext>,
    );
    const dialectsSelect = await findByTestId('dialects-input-container-0');
    fireEvent.keyDown(dialectsSelect.firstChild, { key: 'ArrowDown' });
    fireEvent.click(await (await findByText(Dialects.ABI.label)).nextSibling);
    expect(mockOnChange).toHaveBeenCalledWith([
      {
        dialects: [],
        id: 'dialect-id',
        word: 'word',
        variations: [],
        pronunciation: '',
      },
    ]);
  });

  it.skip('handles resetting audio for dialectal variation', async () => {
    const mockSetDialects = jest.fn();
    const mockSetValue = jest.fn();

    const { findByTestId } = render(
      <TestContext setDialects={mockSetDialects}>
        <CurrentDialectsForms />
      </TestContext>,
    );
    fireEvent.click(await findByTestId('reset-recording-button-dialects.0'));
    expect(mockSetValue).toHaveBeenCalledWith('dialects.0.pronunciation', undefined);
  });
});
