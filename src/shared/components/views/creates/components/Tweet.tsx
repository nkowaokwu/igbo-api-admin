import React, { ReactElement } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Text } from '@chakra-ui/react';

const twitterImage = 'https://pbs.twimg.com/profile_images/1529669157259816960/3Olb8jLG_400x400.jpg';
const CHARACTER_LIMIT = 280;

const Tweet = ({
  text,
  constructedTerm,
  englishTerm,
  definition,
} : {
  text: string,
  constructedTerm?: string,
  englishTerm?: string,
  definition?: string,
}): ReactElement => {
  const finalText = text
    .replaceAll('{constructedTerm}', constructedTerm)
    .replaceAll('{englishTerm}', englishTerm)
    .replaceAll('{definition}', definition);
  return (
    <Box maxWidth="96">
      <Box my={4} className="flex flex-row space-x-4">
        <Avatar name="nkowaokwu" src={twitterImage} />
        <Text overflowWrap="anywhere">{finalText}</Text>
      </Box>
      <Box className="flex flex-row justify-end items-center">
        <Text fontSize="xs" color={finalText.length >= CHARACTER_LIMIT ? 'red' : 'gray.400'}>
          {`${finalText.length} / ${CHARACTER_LIMIT}`}
        </Text>
      </Box>
    </Box>
  );
};

Tweet.propTypes = {
  constructedTerm: PropTypes.string,
  englishTerm: PropTypes.string,
  definition: PropTypes.string,
};

Tweet.defaultProps = {
  constructedTerm: '',
  englishTerm: '',
  definition: '',
};

export default Tweet;
