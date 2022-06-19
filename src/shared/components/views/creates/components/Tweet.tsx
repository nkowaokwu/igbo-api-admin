import React, { ReactElement } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Text,
  chakra,
} from '@chakra-ui/react';

const twitterImage = 'https://pbs.twimg.com/profile_images/1529669157259816960/3Olb8jLG_400x400.jpg';
const CHARACTER_LIMIT = 280;

const Tweet = ({
  text,
  tweetBody,
  pollOptions,
} : {
  text: string,
  tweetBody?: string,
  pollOptions?: string[],
}): ReactElement => {
  const totalText = `${text} ${tweetBody}`;

  return (
    <Box maxWidth="96">
      <Box my={4} className="flex flex-row space-x-4">
        <Avatar name="nkowaokwu" src={twitterImage} />
        <chakra.span overflow="overlay">
          <Text overflowWrap="anywhere">{text}</Text>
          {tweetBody ? <Text color="blue.700">{tweetBody}</Text> : null}
        </chakra.span>
      </Box>
      {pollOptions?.length ? pollOptions.map((pollOption) => (
        <Box
          width="full"
          className="rounded-md"
          backgroundColor="green.200"
          py={2}
          px={4}
          mb={2}
        >
          <Text color="white">{pollOption}</Text>
        </Box>
      )) : null}
      <Box className="flex flex-row justify-end items-center">
        <Text fontSize="xs" color={totalText.length >= CHARACTER_LIMIT ? 'red' : 'gray.400'}>
          {`${totalText.length} / ${CHARACTER_LIMIT}`}
        </Text>
      </Box>
    </Box>
  );
};

Tweet.propTypes = {
  tweetBody: PropTypes.string,
  pollOptions: PropTypes.arrayOf(PropTypes.string),
};

Tweet.defaultProps = {
  tweetBody: '',
  pollOptions: null,
};

export default Tweet;
