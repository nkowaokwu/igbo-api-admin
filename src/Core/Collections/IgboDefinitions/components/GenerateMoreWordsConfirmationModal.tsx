import React, { useState, ReactElement } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Box,
  Tooltip,
  chakra,
} from '@chakra-ui/react';

const GenerateMoreWordsConfirmationModal = ({
  isOpen,
  onClose,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  onClose: (limit: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}): ReactElement => {
  const [limit, setLimit] = useState('5');
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Get More Words</ModalHeader>
        <ModalCloseButton onClick={onCancel} />
        <ModalBody className="space-y-2">
          <Text>Get more word suggestions from existing words that don&apos;t have Igbo definitions.</Text>
          <Text>
            Please enter the number of word suggestions to get.{' '}
            <chakra.span fontWeight="bold">The limit is 10.</chakra.span>
          </Text>
          <Input
            type="number"
            value={limit}
            placeholder="Number of word suggestions to create. i.e. 10"
            onChange={(e) => setLimit(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Tooltip label={!limit ? 'Please specify a number of word suggestions to create' : ''}>
            <Box>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  console.log(`Creating ${limit} new word suggestions without Igbo definitions`);
                  onClose(limit);
                }}
                isDisabled={!limit}
                isLoading={isLoading}
              >
                Get words
              </Button>
            </Box>
          </Tooltip>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GenerateMoreWordsConfirmationModal;
