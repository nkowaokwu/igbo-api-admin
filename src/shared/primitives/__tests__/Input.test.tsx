import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import * as API from 'src/shared/API';
import Collection from 'src/shared/constants/Collection';
import Input from '../Input';

describe('Input', () => {
  it('render the input', async () => {
    const onChangeMock = jest.fn();
    const { findByTestId, findByPlaceholderText } = render(
      <TestContext>
        <Input data-test="testing" placeholder="Input placeholder" onChange={onChangeMock} />
      </TestContext>,
    );
    await findByTestId('testing');
    userEvent.type(await findByPlaceholderText('Input placeholder'), 'a');
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(onChangeMock).toBeCalled();
  });

  it('handle searching the api for nsibidi characters', async () => {
    const onChangeMock = jest.fn();
    const getNsibidiCharactersMock = jest.spyOn(API, 'getNsibidiCharacters').mockReturnValue(Promise.resolve([]));

    const { findByTestId } = render(
      <TestContext>
        <Input searchApi data-test="testing" onChange={onChangeMock} collection={Collection.NSIBIDI_CHARACTERS} />
      </TestContext>,
    );
    userEvent.type(await findByTestId('testing'), 'nsibidi');
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(getNsibidiCharactersMock).toBeCalledWith('nsibidi');
  });
  it('handle searching the api for examples', async () => {
    const onChangeMock = jest.fn();
    const getExamplesMock = jest.spyOn(API, 'getExamples').mockReturnValue(Promise.resolve([]));
    jest.spyOn(API, 'getExampleSuggestions').mockReturnValue(Promise.resolve([]));

    const { findByTestId } = render(
      <TestContext>
        <Input searchApi data-test="testing" onChange={onChangeMock} collection={Collection.EXAMPLES} />
      </TestContext>,
    );
    userEvent.type(await findByTestId('testing'), 'example');
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(getExamplesMock).toBeCalledWith('example');
  });
  it('handle searching the api for example suggestions', async () => {
    const onChangeMock = jest.fn();
    const getExampleSuggestionsMock = jest.spyOn(API, 'getExampleSuggestions').mockReturnValue(Promise.resolve([]));

    const { findByTestId } = render(
      <TestContext>
        <Input searchApi data-test="testing" onChange={onChangeMock} collection={Collection.EXAMPLE_SUGGESTIONS} />
      </TestContext>,
    );
    userEvent.type(await findByTestId('testing'), 'example suggestion');
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(getExampleSuggestionsMock).toBeCalledWith('example suggestion');
  });
  it('handle searching the api for words', async () => {
    const onChangeMock = jest.fn();
    const getWordsMock = jest.spyOn(API, 'getWords').mockReturnValue(Promise.resolve([]));

    const { findByTestId } = render(
      <TestContext>
        <Input searchApi data-test="testing" onChange={onChangeMock} collection={Collection.WORDS} />
      </TestContext>,
    );
    userEvent.type(await findByTestId('testing'), 'word');
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(getWordsMock).toBeCalledWith('word');
  });
});
