import React, { ReactElement, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Text,
} from '@chakra-ui/react';

const InviteMembersModal = ({
  isOpen,
  onInviteMember,
  onClose,
  isLoading,
}: {
  isOpen: boolean;
  onInviteMember: (data: { email: string }) => void;
  onClose: () => void;
  isLoading: boolean;
}): ReactElement => {
  const [email, setEmail] = useState();
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invite new member</ModalHeader>
        <Text fontSize="md" color="gray.500" px={6}>
          Provide the email of the team member you would like to add.
        </Text>
        <ModalCloseButton />
        <ModalBody>
          <Input placeholder="New member email" onChange={(e) => setEmail(e.target.value || '')} />
        </ModalBody>

        <ModalFooter>
          <Button
            mr={3}
            onClick={() => onInviteMember({ email })}
            isDisabled={!email}
            isLoading={isLoading}
            variant="primary"
          >
            Invite Member
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InviteMembersModal;
