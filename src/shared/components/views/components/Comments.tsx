import React, { ReactElement } from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { CommentsProps } from 'src/shared/interfaces';
import NewLineText from 'src/shared/components/NewLineText';
import ShowTextRenderer from 'src/shared/components/views/components/ShowDocumentStats/component/ShowTextRenderer';
import { LuMessageCircle } from 'react-icons/lu';

const Comments = ({ editorsNotes, userComments, showUserComments = true }: CommentsProps): ReactElement => (
  <VStack alignItems="start" width="full" gap={2}>
    <ShowTextRenderer title="Editor's notes" icon={<LuMessageCircle />}>
      <Text className={editorsNotes ? 'text-gray-600' : 'text-gray-500 italic'}>
        {editorsNotes || 'No editor notes'}
      </Text>
    </ShowTextRenderer>
    {showUserComments ? (
      <ShowTextRenderer title="User's comments" icon={<LuMessageCircle />}>
        <Text className={userComments ? 'text-gray-600' : 'text-gray-500 italic'}>
          {userComments ? <NewLineText text={userComments} /> : 'No user comments'}
        </Text>
      </ShowTextRenderer>
    ) : null}
  </VStack>
);

export default Comments;
