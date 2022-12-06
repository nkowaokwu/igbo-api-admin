import React, { ReactElement, useEffect, useState } from 'react';
import { has, startCase } from 'lodash';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { useToast } from '@chakra-ui/react';
import { useRefresh } from 'react-admin';
import useFirebaseUid from 'src/hooks/useFirebaseUid';
import ActionTypes from 'src/shared/constants/ActionTypes';
import Collections from 'src/shared/constants/Collections';
import Views from 'src/shared/constants/Views';
import ConfirmModal from '../ConfirmModal';
import { ConfirmationButtonInterface } from './ConfirmationInterface';
import {
  approveRecord,
  convertUser,
  denyRecord,
  mergeRecord,
} from '../UpdateRecord';
import InputIdForm from './InputIdForm';
import InputNoteForm from './InputNoteForm';

const MAX_EDITING_GROUP_NUMBER = 3;

const Confirmation = ({
  push,
  record,
  resource,
  action,
  collection,
  selectionValue,
  isOpen,
  onClose,
  view,
  setIsLoading,
}: ConfirmationButtonInterface): ReactElement => {
  const [idValue, setIdValue] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(isOpen || false);
  const [uid, setUid] = useState('');
  const refresh = useRefresh();
  const toast = useToast();

  useFirebaseUid(setUid);

  const requiresInput = (
    action?.type === ActionTypes.REQUEST_DELETE
    || action?.type === ActionTypes.ASSIGN_EDITING_GROUP
    || action?.type === ActionTypes.ASSIGN_EDITING_GROUP
  );

  const buildUpdatedRecord = () => {
    switch (action.type) {
      case ActionTypes.APPROVE:
        return approveRecord({ uid, record });
      case ActionTypes.DENY:
        return denyRecord({ uid, record });
      case ActionTypes.MERGE:
        return mergeRecord({ uid, record });
      case ActionTypes.CONVERT:
        return convertUser({ uid, record });
      default:
        return record;
    }
  };

  /**
   * If a wordSuggestion or exampleSuggestion is merged,
   * the editor is redirected to the show view of the updated
   * word or example document
   * @param collectionId
   */
  const handleRedirect = (collectionId: string): void => {
    if (resource === Collections.WORD_SUGGESTIONS && action.type === ActionTypes.MERGE && view === Views.LIST) {
      // If a merger merged within the list view, then they will not be redirected to the show view
    } else if (resource === Collections.WORD_SUGGESTIONS && action.type === ActionTypes.MERGE && view === Views.SHOW) {
      // If a merger merged within the show view, then they will be redirected to the new document show view
      push(`/${Collections.WORDS}/${collectionId}/show`);
    } else if (
      resource === Collections.EXAMPLE_SUGGESTIONS
      && action.type === ActionTypes.MERGE
      && view === Views.LIST
    ) {
      // If a merger merged within the list view, then they will not be redirected to the show view
    } else if (
      resource === Collections.EXAMPLE_SUGGESTIONS
      && action.type === ActionTypes.MERGE
      && view === Views.SHOW
    ) {
      // If a merger merged within the show view, then they will be redirected to the new document show view
      push(`/${Collections.EXAMPLES}/${collectionId}/show`);
    } else {
      push(`/${resource}`);
    }
  };

  /* Reconstructs the toast success message to handle including links to documents */
  const createSuccessDescription = (id) => {
    const newResource = (
      resource === Collections.WORD_SUGGESTIONS
      || resource === Collections.WORDS
    ) ? Collections.WORDS : Collections.EXAMPLES;
    const successDescription = action.hasLink ? (
      <span>
        {`${action.successMessage} `}
        <a className="underline text-blue font-bold" href={`#/${newResource}/${id}/show`}>
          View the updated document here
        </a>
      </span>
    ) : action.successMessage;
    return successDescription;
  };

  const handleClick = (): void => {
    const updatedRecord = buildUpdatedRecord();
    setIsLoading(true);
    action.executeAction({
      record: updatedRecord,
      resource,
      collection,
      value: selectionValue,
    })
      .then((res = { data: { id: '' } }) => {
        const { data } = res;
        const successDescription = createSuccessDescription(data.id);
        toast({
          title: 'Success',
          description: successDescription,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        setIsLoading(false);
        handleRedirect(data?.id);
        refresh();
      })
      .catch((error) => {
        setIsLoading(true);
        toast({
          title: 'Error',
          description: `Error: ${error?.response?.data?.error || error.message}`,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      });
  };

  const provideInputValueUponSubmit = (): void => {
    setIsLoading(true);
    action.executeAction({
      ...(action?.type === ActionTypes.COMBINE
        ? { primaryWordId: idValue }
        : action?.type === ActionTypes.ASSIGN_EDITING_GROUP
          ? { groupNumber: idValue }
          : action?.type === ActionTypes.REQUEST_DELETE
            ? { note: idValue }
            : action?.type === ActionTypes.NOTIFY
              ? { editorsNotes: `${record?.editorsNotes || ''}\n\n${idValue}` }
              : {}),
      resource,
      record,
    })
      .then(({ data }) => {
        if (data?.httpErrorCode?.status === 400) {
          toast({
            title: 'Error',
            description: `Error: ${data.details}`,
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        } else {
          const successDescription = createSuccessDescription(data.id);
          toast({
            title: 'Success',
            description: successDescription,
            status: 'success',
            duration: 4000,
            isClosable: true,
          });
        }

        setIsLoading(false);
        if (!(has(data, 'redirect') && !data.redirect)) {
          push(`/${resource}`);
          refresh();
        }
      })
      .catch((error) => {
        setIsLoading(false);
        toast({
          title: 'Error',
          description: `Error: ${error?.response?.data?.error || error.message}`,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      });
  };

  const handleConfirm = (): any => {
    if (
      action?.type === ActionTypes.COMBINE
      || action?.type === ActionTypes.ASSIGN_EDITING_GROUP
      || action?.type === ActionTypes.REQUEST_DELETE
      || action?.type === ActionTypes.NOTIFY
    ) {
      provideInputValueUponSubmit();
    } else {
      handleClick();
    }
    setIsConfirmOpen(false);
    onClose();
    setIdValue('');
  };

  const determineConfirmColorScheme = () => (
    action?.type === 'Delete' ? 'red' : 'blue'
  );

  useEffect(() => {
    setIsConfirmOpen(!!action);
  }, [action]);

  return (
    <ConfirmModal
      isOpen={isConfirmOpen}
      title={action?.title}
      confirm={startCase(action?.type)}
      cancel="Cancel"
      isDisabled={requiresInput && !idValue}
      onConfirm={handleConfirm}
      confirmColorScheme={determineConfirmColorScheme()}
      onClose={() => {
        setIsConfirmOpen(false);
        setIdValue('');
        onClose();
      }}
    >
      {action?.content}
      {action?.type === ActionTypes.COMBINE ? (
        <InputIdForm
          onSubmit={handleConfirm}
          onChange={(e) => setIdValue(e.target.value)}
          value={idValue}
          header="Id of word that will take on deleted word document's data"
          data-test="primary-word-id-input"
          placeholder="Primary Word Id"
          type="text"
        />
      ) : null}
      {action?.type === ActionTypes.REQUEST_DELETE ? (
        <InputNoteForm
          onSubmit={handleConfirm}
          onChange={(e) => setIdValue(e.target.value)}
          value={idValue}
          header="Provide as much detail as possible."
          data-test="primary-word-id-input"
          placeholder="Reason for deletion request"
          type="text"
        />
      ) : null}
      {action?.type === ActionTypes.ASSIGN_EDITING_GROUP ? (
        <InputIdForm
          onSubmit={handleConfirm}
          onChange={(e) => setIdValue(e.target.value)}
          value={idValue}
          header=""
          data-test="editing-group-number-input"
          placeholder="Editing Group Number"
          type="number"
          max={MAX_EDITING_GROUP_NUMBER}
        />
      ) : null}
      {action?.type === ActionTypes.NOTIFY ? (
        <InputNoteForm
          onSubmit={handleConfirm}
          onChange={(e) => setIdValue(e.target.value)}
          value={idValue}
          header=""
          data-test="notify-input"
          placeholder="Add a message to send to all associated editors"
          type="text"
        />
      ) : null}
    </ConfirmModal>
  );
};

export default connect(null, {
  push,
})(Confirmation);
