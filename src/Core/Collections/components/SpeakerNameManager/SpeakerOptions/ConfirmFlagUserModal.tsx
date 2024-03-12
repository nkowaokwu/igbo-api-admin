import React, { ReactElement, useState } from 'react';
import {
  Button,
  Box,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Radio,
  RadioGroup,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';

const FlagReasons = [
  { reason: 'Inappropriate activity' },
  { reason: 'Inconsistent quality of work' },
  { reason: 'Releasing sensitive or personal information' },
  { reason: 'Other' },
];

const ConfirmFlagUserModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: ({ reason, details }: { reason: string; details: string }) => void;
  title: string;
}): ReactElement => {
  const [reason, setReason] = useState(null);
  const [details, setDetails] = useState(null);
  const toast = useToast();
  const onSubmit = () => {
    if (!reason) {
      toast({
        title: 'Unable to submit form',
        description: 'No reason provided.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }

    onConfirm({ reason, details });
    toast({
      title: 'Success',
      description: 'Report submitted to platform admins.',
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
    onClose();
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <FormControl onSubmit={onSubmit}>
            <Box px={4} my={2}>
              <ModalBody>
                <Text fontSize="sm" fontStyle="italic" color="gray.500">
                  {`It's important to only report users on this platform are not improving our work or dataset. Our team
                investigates all reports to ensure that we keep our platform safe.`}
                </Text>
                <FormLabel>Reason</FormLabel>
                <RadioGroup aria-required colorScheme="purple" onChange={setReason}>
                  {FlagReasons.map(({ reason }) => (
                    <Radio value={reason} key={reason}>
                      {reason}
                    </Radio>
                  ))}
                </RadioGroup>
                <FormLabel>Details</FormLabel>
                <Textarea
                  placeholder="Please share details on this user's activity."
                  rows={4}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </ModalBody>

              <ModalFooter my={2}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="purple" mr={3} type="submit" onClick={onSubmit}>
                  Submit report
                </Button>
              </ModalFooter>
            </Box>
          </FormControl>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmFlagUserModal;
