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

  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onInviteMember({ email });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={onSubmit}>
          <ModalHeader>Invite new member</ModalHeader>
          <Text fontSize="md" color="gray.500" px={6}>
            Provide the email of the team member you would like to add.
          </Text>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder="New member email" onChange={(e) => setEmail(e.target.value || '')} />
          </ModalBody>

          <ModalFooter>
            <Button type="submit" mr={3} isDisabled={!email} isLoading={isLoading} variant="primary">
              Invite Member
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default InviteMembersModal;
