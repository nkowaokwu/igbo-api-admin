import React, { useState, ReactElement } from 'react';
import { useRefresh, useListContext } from 'react-admin';
import { Box, Button, Text, useToast } from '@chakra-ui/react';
import ConfirmModal from './ConfirmModal';
import actionsMap from '../constants/actionsMap';
import Collection from '../constants/Collection';

const BulkSuggestionActions = ({
  resource,
  selectedIds,
}: {
  resource?: Collection;
  selectedIds?: string[];
}): ReactElement => {
  const refresh = useRefresh();
  const toast = useToast();
  const { onUnselectItems } = useListContext();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedAction, setSelectedAction] = useState({
    onConfirm: () => {},
    type: '',
    title: '',
    content: '',
  });
  const mergingCollection =
    resource === Collection.WORD_SUGGESTIONS
      ? Collection.WORDS
      : resource === Collection.EXAMPLE_SUGGESTIONS
      ? Collection.EXAMPLES
      : Collection.CORPUS_SUGGESTIONS;

  const handleBulkMerge = () => {
    setSelectedAction({
      ...actionsMap.Merge,
      onConfirm: async () => {
        try {
          setIsConfirming(true);
          await Promise.all(
            selectedIds.map((selectedId) =>
              actionsMap.Merge.executeAction({
                collection: mergingCollection,
                resource,
                record: { id: selectedId },
              }),
            ),
          );

          toast({
            title: 'Success',
            description: actionsMap.Merge.successMessage,
            status: 'success',
            position: 'top-right',
            variant: 'left-accent',
            duration: 4000,
            isClosable: true,
          });
          onUnselectItems();
          refresh();
        } catch (err) {
          toast({
            title: 'Error',
            description: 'Unable to merge documents',
            status: 'error',
            position: 'top-right',
            variant: 'left-accent',
            duration: 4000,
            isClosable: true,
          });
        } finally {
          setIsConfirmOpen(false);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setSelectedAction({
      ...actionsMap.BulkDelete,
      onConfirm: async () => {
        try {
          setIsConfirming(true);
          await actionsMap.BulkDelete.executeAction({
            resource,
            ids: selectedIds,
          });

          toast({
            title: 'Success',
            description: actionsMap.Merge.successMessage,
            status: 'success',
            position: 'top-right',
            variant: 'left-accent',
            duration: 4000,
            isClosable: true,
          });
          onUnselectItems();
          refresh();
        } catch (err) {
          toast({
            title: 'Error',
            description: 'Unable to delete documents',
            status: 'error',
            position: 'top-right',
            variant: 'left-accent',
            duration: 4000,
            isClosable: true,
          });
        } finally {
          setIsConfirmOpen(false);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  return (
    <Box className="flex flex-row items-center space-x-3 mb-3">
      <Text>Bulk actions</Text>
      <Button data-test="bulk-merge-button" onClick={handleBulkMerge}>
        Merge
      </Button>
      <Button data-test="bulk-merge-button" onClick={handleBulkDelete}>
        Delete
      </Button>
      <ConfirmModal
        isOpen={isConfirmOpen && !!selectedAction.type}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={selectedAction.onConfirm}
        confirm={selectedAction.type}
        isConfirming={isConfirming}
        confirmColorScheme={selectedAction.type === actionsMap.Delete.type ? 'red' : 'blue'}
        cancel="Cancel"
        title={selectedAction.title}
      >
        {selectedAction.content}
      </ConfirmModal>
    </Box>
  );
};

BulkSuggestionActions.defaultProps = {
  resource: '',
  selectedIds: [],
};

export default BulkSuggestionActions;
