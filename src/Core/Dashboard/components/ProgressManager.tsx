import React, { ReactElement } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import Views from 'src/shared/constants/Views';
import DataEntryFlow from 'src/Core/Dashboard/components/DataEntryFlow';

interface LexicographerOption {
  icon: string | ReactElement;
  title: string;
  subtitle: string;
  hash: string;
  buttonLabel: string;
}

const lexicographerOptions: LexicographerOption[] = [
  {
    icon: '💬',
    title: 'Create a New Word',
    subtitle: "Don't see a word in our database? Create a new word here. All words follow Igbo Izugbe standards.",
    hash: `#/wordSuggestions/${Views.CREATE}`,
    buttonLabel: 'Create word',
  },
  {
    icon: '📄',
    title: 'Create a New Example Sentence',
    subtitle: 'Create a new example Igbo sentence. Each sentence includes Igbo and English.',
    hash: `#/exampleSuggestions/${Views.CREATE}`,
    buttonLabel: 'Create example sentence',
  },
  {
    icon: '🈷️',
    title: 'Create a New Nsịbịdị Character',
    subtitle: 'Create a new Nsịbịdị character. Nsịbịdị characters represent a unique concept.',
    hash: `#/nsibidiCharacters/${Views.CREATE}`,
    buttonLabel: 'Create Nsịbịdị character',
  },
  {
    icon: '✍🏾',
    title: 'Edit an Existing Word',
    subtitle: 'See a typo in a definition? Want to add a new dialect? Search for a word and edit it.',
    hash: `#/words/${Views.LIST}`,
    buttonLabel: 'Search for word',
  },
  {
    icon: '✍🏾',
    title: 'Edit an Existing Example Sentence',
    subtitle: 'See a mistake in a translation? Want to add more metadata? Search for a sentence and edit it.',
    hash: `#/examples/${Views.LIST}`,
    buttonLabel: 'Search for example sentence',
  },
  {
    icon: '✍🏾',
    title: 'Edit an Existing Nsịbịdị Character',
    subtitle: 'Want to add more information to an existing character? Search for an Nsịbịdị character and edit it.',
    hash: `#/nsibidiCharacters/${Views.LIST}`,
    buttonLabel: 'Search for Nsịbịdị character',
  },
];

const ProgressManager = (): ReactElement => (
  <Box p={3}>
    <Heading as="h1" className="mb-3">
      Dashboard
    </Heading>
    <Box className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {lexicographerOptions.map((option) => (
        <DataEntryFlow key={option.title} {...option} />
      ))}
    </Box>
  </Box>
);

export default ProgressManager;
