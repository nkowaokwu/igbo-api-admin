import React, { ReactElement } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { CommentsProps } from 'src/shared/interfaces';
import NewLineText from 'src/shared/components/NewLineText';

const Comments = ({ editorsNotes, userComments }: CommentsProps): ReactElement => (
  <Box className="flex flex-col mt-5">
    <Heading as="h1" className="text-xl text-gray-600 mb-3">{'Editor\'s Note'}</Heading>
    <Text className={editorsNotes ? 'text-gray-600' : 'text-gray-500 italic'}>
      {editorsNotes || 'No editor notes'}
    </Text>
    <Heading className="text-xl text-gray-600 mb-3 mt-2">{'User\'s comments'}</Heading>
    <Text className={userComments ? 'text-gray-600' : 'text-gray-500 italic'}>
      {userComments ? <NewLineText text={userComments} /> : 'No user comments'}
    </Text>
  </Box>
);

export default Comments;
