import React from 'react';
import { Modal as ChakraModal, ModalOverlay } from '@chakra-ui/react';

type Props = {
  children: React.ReactNode;
  render: boolean;
  onClose?: () => void;
};

export const Modal = ({ children, onClose, render }: Props): React.ReactElement => (
  <ChakraModal isCentered isOpen={render} onClose={onClose}>
    <ModalOverlay />
    {children}
  </ChakraModal>
);
