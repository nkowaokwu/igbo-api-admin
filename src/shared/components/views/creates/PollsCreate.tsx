import React, { ChangeEvent, ReactElement, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  IconButton,
  Input,
  Link,
  Text,
  chakra,
  Tooltip,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import ConstructedPollThread from 'src/backend/shared/constants/ConstructedPollThread';
import { submitConstructedTermPoll } from 'src/shared/API';
import { CONSTRUCTED_TERMS_REVIEW_DOC } from 'src/Core/constants';
import Tweet from './components/Tweet';

const MINIMUM_POLL_OPTIONS = 2;
const MAXIMUM_POLL_OPTIONS = 4;
const PollsCreate = (): ReactElement => {
  const [tweetBody, setTweetBody] = useState('');
  const [pollOptions, setPollOptions] = useState(['Yes', 'No']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const determinePollPosition = (index: number) => {
    if (index === 0) {
      return 'First';
    }
    if (index === 1) {
      return 'Second';
    }
    if (index === 2) {
      return 'Third';
    }
    if (index === 3) {
      return 'Fourth';
    }
    return null;
  };

  const handlePostingPoll = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (pollOptions.some((pollOption) => !pollOption)) {
        throw new Error('Unable to send poll with empty options');
      }
      const initialTweet = `${ConstructedPollThread[0].text} ${tweetBody}`;
      const poll = {
        text: initialTweet,
        poll: {
          options: pollOptions,
          duration_minutes: 4320,
        },
      };
      await submitConstructedTermPoll(poll);
      toast({
        title: 'Success',
        description: 'Sent the Twitter poll',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < MAXIMUM_POLL_OPTIONS) {
      setPollOptions(pollOptions.concat(['']));
    }
  };

  const handleDeletePollOption = (index: number) => () => {
    const updatedPollOptions = [...pollOptions];
    updatedPollOptions.splice(index, 1);
    setPollOptions(updatedPollOptions);
  };

  const handleUpdatePollOption = (index: number) => (e: ChangeEvent) => {
    const updatedPollOptions = [...pollOptions];
    updatedPollOptions[index] = e.target.value;
    setPollOptions(updatedPollOptions);
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
              <Heading as="h3" fontSize="md" mb={4}>Tweet Body</Heading>
              <Textarea
                required
                name="tweetBody"
                placeholder="Body of the main Tweet"
                defaultValue={tweetBody}
                onChange={(e) => setTweetBody(e.target.value)}
              />
            </Box>
            <Box>
              <Box className="flex flex-row justify-between items-center" mb={4}>
                <Heading as="h3" fontSize="md">Poll Options</Heading>
                {pollOptions.length < MAXIMUM_POLL_OPTIONS ? (
                  <IconButton
                    colorScheme="green"
                    aria-label="Add poll option"
                    icon={<AddIcon />}
                    onClick={handleAddPollOption}
                  />
                ) : null}
              </Box>
              {pollOptions.map((option, index) => (
                <Box mb={3}>
                  <Text fontWeight="bold">{`${determinePollPosition(index)} option:`}</Text>
                  <Box className="flex flex-row justify-between items-center">
                    <Input
                      placeholder={`${determinePollPosition(index)} option`}
                      value={option}
                      onChange={handleUpdatePollOption(index)}
                    />
                    {pollOptions.length > MINIMUM_POLL_OPTIONS ? (
                      <Tooltip label="Delete poll option">
                        <IconButton
                          ml={4}
                          color="red"
                          aria-label="Delete poll option"
                          icon={<DeleteIcon />}
                          onClick={handleDeletePollOption(index)}
                        />
                      </Tooltip>
                    ) : null}
                  </Box>
                </Box>
              ))}

            </Box>
          </Box>
          <Box flex={3} className="w-full">
            <Heading as="h3" fontSize="md" mb={4}>Final Twitter thread</Heading>
            {ConstructedPollThread.map(({ text }, index) => (
              <Tweet
                text={text}
                {...(index === 0 ? { tweetBody } : {})}
                {...(index === 0 ? { pollOptions } : {})}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default PollsCreate;
