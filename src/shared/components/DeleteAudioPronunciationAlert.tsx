import React, { ReactElement } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';

const DeleteAudioPronunciationAlert = ({
  isOpen,
  onConfirm,
  onClose,
  cancelRef,
} : {
  isOpen: boolean,
  onConfirm: () => void,
  onClose: () => void,
  cancelRef: React.RefObject<HTMLButtonElement>,
}): ReactElement => (
  <AlertDialog
    isOpen={isOpen}
    leastDestructiveRef={cancelRef}
    onClose={onClose}
  >
    <AlertDialogOverlay>
      <AlertDialogContent>
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          Delete Customer
        </AlertDialogHeader>

        <AlertDialogBody>
          {'Are you sure? You can\'t undo this action afterwards.'}
        </AlertDialogBody>

        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={onConfirm} ml={3}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
);

export default DeleteAudioPronunciationAlert;
