import React, { useState, ReactElement } from 'react';
import { useRefresh, useListContext } from 'react-admin';
import {
  Box,
  Button,
  Text,
  useToast,
} from '@chakra-ui/react';
import ConfirmModal from './ConfirmModal';
import actionsMap from '../constants/actionsMap';
import Collection from '../constants/Collections';

const BulkSuggestionActions = ({
  selectedIds,
}: {
  selectedIds: string[];
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

  return (
    <Box className="flex flex-row items-center space-x-3 mb-3">
      <Text>Bulk actions</Text>
      <Button
        data-test="bulk-merge-button"
        onClick={() => {
          setSelectedAction({
            ...actionsMap.Merge,
            onConfirm: async () => {
              try {
                setIsConfirming(true);
                await Promise.all(
                  selectedIds.map((selectedId) => (
                    actionsMap.Merge.executeAction({
                      collection: Collection.WORDS,
                      record: { id: selectedId },
                    })
                  )),
                );
                toast({
                  title: 'Success',
                  description: actionsMap.Merge.successMessage,
                  status: 'success',
                  duration: 4000,
                  isClosable: true,
                });
                setIsConfirming(false);
                onUnselectItems();
                refresh();
              } catch (err) {
                setIsConfirming(false);
              }
            },
          });
          setIsConfirmOpen(true);
        }}
      >
        Merge
      </Button>
      <ConfirmModal
        isOpen={isConfirmOpen && !!selectedAction.type}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={selectedAction.onConfirm}
        confirm={selectedAction.type}
        isConfirming={isConfirming}
        confirmColorScheme={
          selectedAction.type === actionsMap.Delete.type ? 'red' : 'blue'
        }
        cancel="Cancel"
        title={selectedAction.title}
      >
        {selectedAction.content}
      </ConfirmModal>
    </Box>
  );
};

export default BulkSuggestionActions;
