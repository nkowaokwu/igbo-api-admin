import React, { ReactElement, useRef } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useBreakpointValue,
} from '@chakra-ui/react';
import { isMobile } from 'react-device-detect';
import ConfirmModalInterface from './ConfirmModalInterface';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
  confirm,
  confirmColorScheme,
  cancel,
  title,
  isDisabled,
  children,
}: ConfirmModalInterface): ReactElement => {
  const ContainerComponent = useBreakpointValue({ base: Drawer, md: AlertDialog });
  const ContainerOverlay = useBreakpointValue({ base: DrawerOverlay, md: AlertDialogOverlay });
  const ContainerContent = useBreakpointValue({ base: DrawerContent, md: AlertDialogContent });
  const ContainerHeader = useBreakpointValue({ base: DrawerHeader, md: AlertDialogHeader });
  const ContainerBody = useBreakpointValue({ base: DrawerBody, md: AlertDialogBody });
  const ContainerFooter = useBreakpointValue({ base: DrawerFooter, md: AlertDialogFooter });
  const cancelRef = useRef();

  return (
    <ContainerComponent
      closeOnEsc={false}
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      placement="bottom"
    >
      <ContainerOverlay
        style={{
          left: 'auto',
          right: 0,
          top: 'auto',
          bottom: 0,
        }}
      />
      <ContainerContent
        position={isMobile ? 'fixed' : undefined}
        right={isMobile ? '250px' : undefined}
        opacity={isOpen ? '1 !important' : 0}
        style={{ left: 'auto !important' }}
      >
        <ContainerHeader fontSize="lg" fontWeight="bold">
          {title}
        </ContainerHeader>

        <ContainerBody>
          {children}
        </ContainerBody>

        <ContainerFooter>
          <Button
            ref={cancelRef}
            onClick={onClose}
            data-test="confirmation-cancel-button"
          >
            {cancel}
          </Button>
          <Button
            colorScheme={confirmColorScheme}
            onClick={isDisabled ? noop : onConfirm}
            isLoading={isConfirming}
            disabled={isDisabled}
            ml={3}
            data-test="confirmation-confirm-button"
          >
            {confirm}
          </Button>
        </ContainerFooter>
      </ContainerContent>
    </ContainerComponent>
  );
};

ConfirmModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

ConfirmModal.defaultProps = {
  isDisabled: false,
};

export default ConfirmModal;
