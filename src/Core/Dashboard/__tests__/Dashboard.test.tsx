import React from 'react';
import fetchMock from 'jest-fetch-mock';
import { render } from '@testing-library/react';
import Dashboard from 'src/Core/Dashboard';
import {
  COMPLETE_WORDS_GOAL,
  SUFFICIENT_WORDS_GOAL,
  HEADWORD_AUDIO_PRONUNCIATION_GOAL,
  WORDS_WITH_NSIBIDI_GOAL,
  IS_STANDARD_IGBO_GOAL,
  EXAMPLE_SENTENCES_GOAL,
} from 'src/Core/constants';

jest.mock('axios');
fetchMock.enableMocks();

it('render the dashboard', async () => {
  fetchMock.mockIf(/\/stats/, async (req) => {
    if (req.url.endsWith('words')) {
      return {
        status: 200,
        body: JSON.stringify({ sufficientWordsCount: 200, completedWordsCount: 100 }),
      };
    }
    if (req.url.endsWith('headwordAudioPronunciations')) {
      return {
        status: 200,
        body: JSON.stringify({ count: 300 }),
      };
    }
    if (req.url.endsWith('nsibidi')) {
      return {
        status: 200,
        body: JSON.stringify({ count: 400 }),
      };
    }
    if (req.url.endsWith('isStandardIgbo')) {
      return {
        status: 200,
        body: JSON.stringify({ count: 500 }),
      };
    }
    if (req.url.endsWith('examples')) {
      return {
        status: 200,
        body: JSON.stringify({ count: 600 }),
      };
    }

    return null;
  });
  const { findByText } = render(<Dashboard />);
  await findByText('"Complete" Words');
  await findByText('"Sufficient" Words');
  await findByText('Headwords with Audio Pronunciations');
  await findByText('Words with Nsịbịdị');
  await findByText('Standard Igbo Words');
  await findByText('Igbo Example Sentences');

  await findByText(`100 / ${COMPLETE_WORDS_GOAL}`);
  await findByText(`200 / ${SUFFICIENT_WORDS_GOAL}`);
  await findByText(`300 / ${HEADWORD_AUDIO_PRONUNCIATION_GOAL}`);
  await findByText(`400 / ${WORDS_WITH_NSIBIDI_GOAL}`);
  await findByText(`500 / ${IS_STANDARD_IGBO_GOAL}`);
  await findByText(`600 / ${EXAMPLE_SENTENCES_GOAL}`);
});
