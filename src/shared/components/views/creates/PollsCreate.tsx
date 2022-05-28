import React, { ReactElement, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  Link,
  Text,
  chakra,
  Tooltip,
} from '@chakra-ui/react';
import ConstructedPollThread from 'src/backend/shared/constants/ConstructedPollThread';
import { submitConstructedTermPoll } from 'src/shared/API';
import { CONSTRUCTED_TERMS_REVIEW_DOC } from 'src/Core/constants';
import Tweet from './components/Tweet';

const PollsCreate = (): ReactElement => {
  const [constructedTerm, setConstructedTerm] = useState('');
  const [englishTerm, setEnglishTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostingPoll = (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const initialTweet = ConstructedPollThread[0].text
        .replaceAll('{constructedTerm}', constructedTerm)
        .replaceAll('{englishTerm}', englishTerm)
        .replaceAll('{definition}', definition);
      const poll = {
        constructedTerm,
        englishTerm,
        definition,
        text: initialTweet,
        poll: {
          options: ['Yes', 'No'],
          duration_minutes: 4320,
        },
      };
      submitConstructedTermPoll(poll);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountAuthorization = () => {
    window.open(`${window.location.protocol}//${window.location.host}/twitter_auth`, '_blank');
  };

  return (
    <form onSubmit={handlePostingPoll}>
      <Box className="bg-white shadow-sm p-10 mt-10">
        <Box className="flex flex-col-reverse lg:flex-row justify-between lg:items-center">
          <Heading>Create a new Constructed Term Poll</Heading>
          <Tooltip label="This will authorize the @nkowaokwu Twitter account to post on your behalf" placement="top">
            <Button
              type="submit"
              colorScheme="green"
              variant="outline"
              className="mb-4 lg:mb-0"
              onClick={handleAccountAuthorization}
            >
              Authorize account
            </Button>
          </Tooltip>
          <Tooltip label="This poll will be posted on the public @nkowaokwu Twitter account" placement="top">
            <Button
              type="submit"
              colorScheme="green"
              variant="solid"
              isLoading={isSubmitting}
              className="mb-4 lg:mb-0"
            >
              Post poll
            </Button>
          </Tooltip>
        </Box>
        <Text fontWeight="bold">What is a Constructed Term?</Text>
        <Text>
          {'A Constructed Term is a recently created Igbo word that follows our carefully created '}
          <chakra.span>
            <Link to={CONSTRUCTED_TERMS_REVIEW_DOC} textDecoration="underline" color="green.600" fontStyle="italic">
              Nkọwa okwu Newly Constructed Words Review Process
            </Link>
          </chakra.span>
          {` document. This page allow translators to directly poll the Twitter Igbo community on whether 
          this is a word that they can see themselves using.`}
        </Text>
        <Box
          className="flex flex-col lg:flex-row lg:justify-center items-start space-y-10 lg:space-y-0 lg:space-x-24 my-6"
        >
          <Box flex={2} className="w-full space-y-4">
            <Box>
              <Heading as="h3" fontSize="md" mb={4}>Constructed Term</Heading>
              <Input
                required
                name="constructedTerm"
                placeholder="Newly constructed Igbo term"
                defaultValue={constructedTerm}
                onChange={(e) => setConstructedTerm(e.target.value)}
              />
            </Box>
            <Box>
              <Heading as="h3" fontSize="md" mb={4}>English equivalent</Heading>
              <Input
                required
                name="englishTerm"
                placeholder="Constructed term's English equivalent"
                defaultValue={englishTerm}
                onChange={(e) => setEnglishTerm(e.target.value)}
              />
            </Box>
            <Box>
              <Heading as="h3" fontSize="md" mb={4}>Definition</Heading>
              <Input
                required
                name="definition"
                placeholder="Constructed term definition"
                defaultValue={definition}
                onChange={(e) => setDefinition(e.target.value)}
              />
            </Box>
          </Box>
          <Box flex={3} className="w-full">
            <Heading as="h3" fontSize="md" mb={4}>Final Twitter thread</Heading>
            {ConstructedPollThread.map(({ text }) => (
              <Tweet text={text} constructedTerm={constructedTerm} englishTerm={englishTerm} definition={definition} />
            ))}
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default PollsCreate;
