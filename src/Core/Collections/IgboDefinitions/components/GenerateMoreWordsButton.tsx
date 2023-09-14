import React, { useState, ReactElement } from 'react';
import { Button, useToast, useDisclosure, Tooltip, Box } from '@chakra-ui/react';
import { postWordSuggestionsForIgboDefinitions } from 'src/shared/DataCollectionAPI';
// eslint-disable-next-line max-len
import GenerateMoreWordsConfirmationModal from 'src/Core/Collections/IgboDefinitions/components/GenerateMoreWordsConfirmationModal';

const GenerateMoreWordsButton = ({ isDisabled = false }: { isDisabled?: boolean }): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const handleRequestMoreWords = async (limit: string) => {
    try {
      setIsLoading(true);
      const { message } = await postWordSuggestionsForIgboDefinitions({ limit: parseInt(limit, 10) });
      toast({
        title: 'Success',
        description: `${message}. Refresh the page.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Unable to create word suggestions',
        description: 'Unable to create word suggestions. Please try again.',
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
      <GenerateMoreWordsConfirmationModal
        isLoading={isLoading}
        isOpen={isOpen}
        onClose={handleRequestMoreWords}
        onCancel={onClose}
      />
      <Tooltip label={isDisabled ? 'There are word suggestions that need Igbo definitions.' : ''}>
        <Box>
          <Button
            position={{ base: 'relative', md: 'absolute' }}
            top="4rem"
            right="0"
            isLoading={isLoading}
            onClick={onOpen}
          >
            Get more words
          </Button>
        </Box>
      </Tooltip>
    </>
  );
};

export default GenerateMoreWordsButton;
