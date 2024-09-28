import React, { ReactElement } from 'react';
import { Box, Button, HStack, Show, Tooltip, VStack } from '@chakra-ui/react';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import { LuBan, LuCheck } from 'react-icons/lu';

interface ResourceReviewerInterface {
  onApprove: () => void;
  onDeny: () => void;
  reviewAction: ReviewActions;
  children: any;
}

const DesktopView = ({ onDeny, onApprove, reviewAction, children }: ResourceReviewerInterface) => (
  <HStack alignItems="center" gap={2} width="full">
    <Tooltip label="Deny">
      <Button
        onClick={onDeny}
        aria-label={`Deny${reviewAction === ReviewActions.DENY ? ' selected' : ''}`}
        {...(reviewAction === ReviewActions.DENY ? { variant: 'primary' } : {})}
      >
        {reviewAction === ReviewActions.DENY ? 'Denied' : 'Deny'}
      </Button>
    </Tooltip>
    {React.Children.map(children, (child) => React.cloneElement(child))}
    <Tooltip label="Approve">
      <Button
        onClick={onApprove}
        aria-label={`Deny${reviewAction === ReviewActions.APPROVE ? ' selected' : ''}`}
        {...(reviewAction === ReviewActions.APPROVE ? { variant: 'primary' } : {})}
      >
        {reviewAction === ReviewActions.APPROVE ? 'Approved' : 'Approve'}
      </Button>
    </Tooltip>
  </HStack>
);

const MobileView = ({ onDeny, onApprove, reviewAction, children }: ResourceReviewerInterface) => (
  <VStack width="full">
    {React.Children.map(children, (child) => React.cloneElement(child))}
    <HStack width="full" gap={2}>
      <Tooltip label="Deny">
        <Button
          onClick={onDeny}
          aria-label={`Deny${reviewAction === ReviewActions.DENY ? ' selected' : ''}`}
          {...(reviewAction === ReviewActions.DENY ? { variant: 'primary' } : {})}
          flex={1}
          leftIcon={<LuBan />}
        >
          {reviewAction === ReviewActions.DENY ? 'Denied' : 'Deny'}
        </Button>
      </Tooltip>
      <Tooltip label="Approve">
        <Button
          onClick={onApprove}
          aria-label={`Deny${reviewAction === ReviewActions.APPROVE ? ' selected' : ''}`}
          {...(reviewAction === ReviewActions.APPROVE ? { variant: 'primary' } : {})}
          flex={1}
          leftIcon={<LuCheck />}
        >
          {reviewAction === ReviewActions.APPROVE ? 'Approved' : 'Approve'}
        </Button>
      </Tooltip>
    </HStack>
  </VStack>
);

const ResourceReviewer = (props: ResourceReviewerInterface): ReactElement => (
  <Box
    className="text-center flex flex-row justify-center w-full"
    backgroundColor="gray.200"
    borderRadius="md"
    my={3}
    p={3}
  >
    <Show above="md">
      <DesktopView {...props} />
    </Show>
    <Show below="md">
      <MobileView {...props} />
    </Show>
  </Box>
);

export default ResourceReviewer;
