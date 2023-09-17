import React from 'react';
import { first, last } from 'lodash';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestContext from 'src/__tests__/components/TestContext';
import * as DataCollectionAPI from 'src/shared/DataCollectionAPI';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import { RECORDING_AUDIO_STANDARDS_DOC } from 'src/Core/constants';
import VerifySentenceAudio from '../VerifySentenceAudio';

const exampleData = [
  {
    igbo: 'igbo',
    id: 'id',
    pronunciations: [
      {
        audio: 'first audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'first audio id',
      },
      {
        audio: 'second audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'second audio id',
      },
    ],
  },
];

const examplesData = [
  {
    igbo: 'igbo',
    id: 'first id',
    pronunciations: [
      {
        audio: 'first first audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'first first audio id',
      },
      {
        audio: 'first second audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'first second audio id',
      },
    ],
  },
  {
    igbo: 'igbo',
    id: 'second id',
    pronunciations: [
      {
        audio: 'second first audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'second first audio id',
      },
      {
        audio: 'second second audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'second second audio id',
      },
    ],
  },
  {
    igbo: 'igbo',
    id: 'third id',
    pronunciations: [
      {
        audio: 'third first audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'third first audio id',
      },
      {
        audio: 'third second audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'third second audio id',
      },
    ],
  },
  {
    igbo: 'igbo',
    id: 'fourth id',
    pronunciations: [
      {
        audio: 'fourth first audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'fourth first audio id',
      },
      {
        audio: 'fourth second audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'fourth second audio id',
      },
    ],
  },
  {
    igbo: 'igbo',
    id: 'fifth id',
    pronunciations: [
      {
        audio: 'fifth first audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'fifth first audio id',
      },
      {
        audio: 'fifth second audio',
        speaker: '',
        approvals: [],
        denials: [],
        review: true,
        _id: 'fifth second audio id',
      },
    ],
  },
];

describe('VerifySentenceAudio', () => {
  it('render page to show five example sentences', async () => {
    const { findByText } = render(
      <TestContext>
        <VerifySentenceAudio />
      </TestContext>,
    );
    await findByText('Listen to know if this sentence matches the audio');
    await findByText('Submit');
  });

  it('render multiple audio pronunciation review sections for a single sentence', async () => {
    // @ts-expect-error
    DataCollectionAPI.getRandomExampleSuggestionsToReview.mockImplementation(async () => ({
      data: exampleData,
    }));
    const { findByText, findAllByLabelText } = render(
      <TestContext>
        <VerifySentenceAudio />
      </TestContext>,
    );
    await findByText('1 / 1');
    const approveButtons = await findAllByLabelText('Approve');
    const denyButtons = await findAllByLabelText('Deny');
    expect(approveButtons).toHaveLength(2);
    expect(denyButtons).toHaveLength(2);
  });

  it('render multiple audio pronunciation review sections for five sentences', async () => {
    // @ts-expect-error
    DataCollectionAPI.getRandomExampleSuggestionsToReview.mockImplementation(async () => ({
      data: examplesData,
    }));
    const { container, findByText, findAllByLabelText, findByLabelText } = render(
      <TestContext>
        <VerifySentenceAudio />
      </TestContext>,
    );
    await findByText('1 / 5');
    const approveButtons = await findAllByLabelText('Approve');
    const denyButtons = await findAllByLabelText('Deny');
    expect(approveButtons).toHaveLength(2);
    expect(denyButtons).toHaveLength(2);
    expect(container.querySelector('audio[src="first first audio"]')).toBeTruthy();
    expect(container.querySelector('audio[src="first second audio"]')).toBeTruthy();

    userEvent.click(await findByLabelText('Next sentence'));
    await findByText('2 / 5');
    expect(container.querySelector('audio[src="second first audio"]')).toBeTruthy();
    expect(container.querySelector('audio[src="second second audio"]')).toBeTruthy();

    userEvent.click(await findByLabelText('Next sentence'));
    await findByText('3 / 5');
    expect(container.querySelector('audio[src="third first audio"]')).toBeTruthy();
    expect(container.querySelector('audio[src="third second audio"]')).toBeTruthy();

    userEvent.click(await findByLabelText('Next sentence'));
    await findByText('4 / 5');
    expect(container.querySelector('audio[src="fourth first audio"]')).toBeTruthy();
    expect(container.querySelector('audio[src="fourth second audio"]')).toBeTruthy();

    userEvent.click(await findByLabelText('Next sentence'));
    await findByText('5 / 5');
    expect(container.querySelector('audio[src="fifth first audio"]')).toBeTruthy();
    expect(container.querySelector('audio[src="fifth second audio"]')).toBeTruthy();

    userEvent.click(await findByLabelText('Next sentence'));
    await findByText('5 / 5');
    userEvent.click(await findByLabelText('Previous sentence'));
    await findByText('4 / 5');
    expect(container.querySelector('audio[src="fourth first audio"]')).toBeTruthy();
    expect(container.querySelector('audio[src="fourth second audio"]')).toBeTruthy();

    userEvent.click(await findByLabelText('Previous sentence'));
    await findByText('3 / 5');
    expect(container.querySelector('audio[src="third first audio"]')).toBeTruthy();
    expect(container.querySelector('audio[src="third second audio"]')).toBeTruthy();

    userEvent.click(await findByLabelText('Previous sentence'));
    await findByText('2 / 5');
    expect(container.querySelector('audio[src="second first audio"]')).toBeTruthy();
    expect(container.querySelector('audio[src="second second audio"]')).toBeTruthy();

    userEvent.click(await findByLabelText('Previous sentence'));
    await findByText('1 / 5');
    expect(container.querySelector('audio[src="first first audio"]')).toBeTruthy();
    expect(container.querySelector('audio[src="first second audio"]')).toBeTruthy();

    userEvent.click(await findByLabelText('Previous sentence'));
    await findByText('1 / 5');
  });

  it('select first approve and second deny button', async () => {
    // @ts-expect-error
    DataCollectionAPI.getRandomExampleSuggestionsToReview.mockImplementation(async () => ({
      data: exampleData,
    }));
    const { findByText, findAllByLabelText, findByLabelText } = render(
      <TestContext>
        <VerifySentenceAudio />
      </TestContext>,
    );
    await findByText('1 / 1');
    userEvent.click(first(await findAllByLabelText('Approve')));
    userEvent.click(last(await findAllByLabelText('Deny')));
    await findByLabelText('Approve selected');
    await findByLabelText('Deny selected');
  });

  it('submit reviewed audio', async () => {
    // @ts-expect-error
    DataCollectionAPI.getRandomExampleSuggestionsToReview.mockImplementation(async () => ({
      data: examplesData,
    }));
    const reviewSpy = jest.spyOn(DataCollectionAPI, 'putReviewForRandomExampleSuggestions');
    const { getByLabelText, findByText, findAllByLabelText, findByLabelText } = render(
      <TestContext>
        <VerifySentenceAudio />
      </TestContext>,
    );
    await findByText('1 / 5');
    userEvent.click(first(await findAllByLabelText('Approve')));
    userEvent.click(last(await findAllByLabelText('Deny')));
    await findByLabelText('Approve selected');
    await findByLabelText('Deny selected');
    userEvent.click(getByLabelText('Next sentence'));
    userEvent.click(getByLabelText('Next sentence'));
    userEvent.click(getByLabelText('Next sentence'));
    userEvent.click(getByLabelText('Next sentence'));
    userEvent.click(await findByText('Submit'));
    expect(reviewSpy).toBeCalledWith([
      {
        id: 'first id',
        reviews: {
          'first first audio id': ReviewActions.APPROVE,
          'first second audio id': ReviewActions.DENY,
        },
      },
      {
        id: 'second id',
        reviews: {
          'second first audio id': ReviewActions.SKIP,
          'second second audio id': ReviewActions.SKIP,
        },
      },
      {
        id: 'third id',
        reviews: {
          'third first audio id': ReviewActions.SKIP,
          'third second audio id': ReviewActions.SKIP,
        },
      },
      {
        id: 'fourth id',
        reviews: {
          'fourth first audio id': ReviewActions.SKIP,
          'fourth second audio id': ReviewActions.SKIP,
        },
      },
      {
        id: 'fifth id',
        reviews: {
          'fifth first audio id': ReviewActions.SKIP,
          'fifth second audio id': ReviewActions.SKIP,
        },
      },
    ]);
  });

  it('should link to recording audio standards doc', async () => {
    const { findByText } = render(
      <TestContext>
        <VerifySentenceAudio />
      </TestContext>,
    );
    await findByText(/^Each audio should follow our/);
    const recordingAudioStandardsDocLink = document.querySelector(`[href="${RECORDING_AUDIO_STANDARDS_DOC}"`);
    expect(recordingAudioStandardsDocLink).toBeTruthy();
  });

  it('renders the example sentence', async () => {
    // @ts-expect-error
    DataCollectionAPI.getRandomExampleSuggestionsToReview.mockImplementation(async () => ({
      data: exampleData,
    }));
    const { findByText } = render(
      <TestContext>
        <VerifySentenceAudio />
      </TestContext>,
    );
    await findByText('igbo');
  });
});
