import React, { ReactElement, useState } from 'react';
import { Button, useDisclosure, useToast } from '@chakra-ui/react';
// eslint-disable-next-line max-len
import DeleteOldWordSuggestionsConfirmationModal from 'src/shared/components/actions/components/DeleteOldWordSuggestionsConfirmationModal';

const DeleteOldWordSuggestionsButton = (): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleDeleteWordSuggestions = async () => {
    try {
      setIsLoading(true);
      // const { data } = await deleteOldWordSuggestions();
      // console.log(`Total word suggestions delete: ${data.result.deletedCount}`);
      toast({
        title: 'Success',
        description: 'Deleted all old word suggestions.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Unable to delete old word suggestions. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <>
      <DeleteOldWordSuggestionsConfirmationModal
        isOpen={isOpen}
        onCancel={onClose}
        onClose={handleDeleteWordSuggestions}
        isLoading={isLoading}
      />
      <Button colorScheme="red" onClick={onOpen} isLoading={isLoading}>
        Delete old Word Suggestions
      </Button>
    </>
  );
};

export default DeleteOldWordSuggestionsButton;
