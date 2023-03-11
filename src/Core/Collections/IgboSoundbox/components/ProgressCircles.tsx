import React, { ReactElement } from 'react';
import { Box, Text } from '@chakra-ui/react';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import CardMessageColor from '../constants/CardMessageColor';

const ProgressCircles = ({
  reviews,
  exampleIndex,
} : {
  reviews: { editorsNotes: string, review: ReviewActions }[],
  exampleIndex: number,
}) : ReactElement => (
  <Box display="flex" flexDirection="row" className="space-x-6" my="6">
    {reviews.map(({ review }, reviewIndex) => (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          borderRadius="full"
          backgroundColor="white"
          borderWidth="2px"
          borderColor={CardMessageColor[review]}
          height="40px"
          width="40px"
        />
        <Text userSelect="none" opacity={exampleIndex === reviewIndex ? 1 : 0} mt="2">☝🏾</Text>
      </Box>
    ))}
  </Box>
);

export default ProgressCircles;
