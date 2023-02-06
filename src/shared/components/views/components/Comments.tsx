import React, { ReactElement } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { CommentsProps } from 'src/shared/interfaces';
import NewLineText from 'src/shared/components/NewLineText';

const Comments = ({ editorsNotes, userComments, showUserComments = true }: CommentsProps): ReactElement => (
  <Box className="flex flex-col mt-12 space-y-6">
    <Box>
      <Heading as="h2" fontSize="xl" className="text-gray-600 mb-3">{'Editor\'s Note'}</Heading>
      <Text className={editorsNotes ? 'text-gray-600' : 'text-gray-500 italic'}>
        {editorsNotes || 'No editor notes'}
      </Text>
    </Box>
    {showUserComments ? (
      <Box>
        <Heading as="h2" fontSize="xl" className="text-gray-600 mb-3 mt-2">{'User\'s comments'}</Heading>
        <Text className={userComments ? 'text-gray-600' : 'text-gray-500 italic'}>
          {userComments ? <NewLineText text={userComments} /> : 'No user comments'}
        </Text>
      </Box>
    ) : null}
  </Box>
);

export default Comments;
