import React, { ReactElement } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  chakra,
} from '@chakra-ui/react';
import moment from 'moment';

const DeleteOldWordSuggestionsConfirmationModal = ({
  isOpen,
  onClose,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  isLoading: boolean;
}): ReactElement => (
  <Modal isOpen={isOpen} onClose={onCancel}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Delete Old Word Suggestions</ModalHeader>
      <ModalCloseButton onClick={onCancel} />
      <ModalBody className="space-y-2">
        <Text>
          {/* eslint-disable-next-line max-len */}
          You will be <chakra.span fontWeight="bold">permanently</chakra.span> deleting Word Suggestions created before{' '}
          <chakra.span fontWeight="bold">{moment().subtract(1, 'year').format('MMMM DD, YYYY')}</chakra.span>.
        </Text>
        <Text fontSize="sm" color="gray.600" fontStyle="italic">
          This excludes Word Suggestions submitted by Nkọwa okwu users.
        </Text>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button colorScheme="red" mr={3} onClick={onClose} isLoading={isLoading}>
          Delete word suggestions
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
export default DeleteOldWordSuggestionsConfirmationModal;
