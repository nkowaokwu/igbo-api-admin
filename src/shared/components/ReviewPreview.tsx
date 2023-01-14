import React, { ReactElement, useState } from 'react';
import { Box, Tooltip } from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import useFirebaseUid from 'src/hooks/useFirebaseUid';

/* Determines whether or not current user has reviewed the current document */
const ReviewPreview = ({
  record = { id: null, approvals: [], denials: [] },
}: {
  label?: string,
  record?: { id: string | null, approvals: string[], denials: string[] },
}): ReactElement => {
  const [uid, setUid] = useState('');
  useFirebaseUid(setUid);

  const hasReviewed = record.approvals?.includes?.(uid) || record.denials?.includes?.(uid) || record.authorId === uid;
  return (
    <Box data-test="review-cell" className="flex w-full justify-center items-center">
      {record && hasReviewed ? (
        <Tooltip label="You have already reviewed this document." aria-label="A tooltip">
          <CheckIcon color="green.500" data-test="reviewed-icon" />
        </Tooltip>
      ) : (
        <Tooltip label="You have not reviewed this document." aria-label="A tooltip">
          <CloseIcon color="yellow.500" data-test="not-reviewed-icon" />
        </Tooltip>
      )}
    </Box>
  );
};

ReviewPreview.defaultProps = {
  label: '',
  record: { id: null, approvals: [], denials: [] },
};

export default ReviewPreview;
