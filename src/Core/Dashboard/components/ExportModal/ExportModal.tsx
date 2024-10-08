import React, { ReactElement, useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useToast,
} from '@chakra-ui/react';
import { exportData } from 'src/shared/DataCollectionAPI';

const ExportModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): ReactElement => {
  const [exportTriggered, setExportTriggered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleOnExport = async () => {
    try {
      setIsLoading(true);
      await exportData();
      setExportTriggered(true);
    } catch (err) {
      toast({
        title: 'Unable to export',
        description: 'An error has occurred. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnClose = () => {
    onClose();
    setExportTriggered(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Export project data</ModalHeader>
        <ModalBody>
          {exportTriggered
            ? 'All set! We are downloading your dataset. You will receive an email when it is done.'
            : // eslint-disable-next-line max-len
              'Download all your finalized dataset. You will receive an email with a link to download all your data. This may take a few minutes.'}
        </ModalBody>
        <ModalFooter gap={3}>
          {!exportTriggered ? (
            <Button flex={1} onClick={onClose} isDisabled={isLoading}>
              Cancel
            </Button>
          ) : null}
          <Button
            flex={1}
            variant="primary"
            onClick={exportTriggered ? handleOnClose : handleOnExport}
            isLoading={isLoading}
          >
            {exportTriggered ? 'Okay' : 'Export'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExportModal;
