import React, { ReactElement, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Input, useToast } from '@chakra-ui/react';
import { useRefresh } from 'react-admin';
import ConfirmModal from '../ConfirmModal';
import ActionTypes from '../../constants/ActionTypes';
import Collections from '../../constants/Collections';
import Views from '../../constants/Views';
import { ConfirmationButtonInterface, ConfirmationInputInterface } from './ConfirmationInterface';
import useFirebaseUid from '../../../hooks/useFirebaseUid';
import {
  approveRecord,
  convertUser,
  denyRecord,
  mergeRecord,
} from '../UpdateRecord';

const MAX_EDITING_GROUP_NUMBER = 3;

/* Custom form for taking in word ids */
const InputIdForm = (
  {
    onChange,
    value,
    onSubmit,
    header,
    ...rest
  }: ConfirmationInputInterface,
) => (
  <form onSubmit={onSubmit}>
    <h1 className="text-gray-700">{header}</h1>
    <Input
      required
      className="h-10 w-full lg:w-64 bg-gray-300 px-4 rounded-lg border border-solid border-gray-400"
      type="text"
      value={value}
      onChange={onChange}
      {...rest}
    />
  </form>
);

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
}: ConfirmationButtonInterface): ReactElement => {
  const [idValue, setIdValue] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(isOpen || false);
  const [uid, setUid] = useState('');
  const refresh = useRefresh();
  const toast = useToast();

  useFirebaseUid(setUid);

  const buildUpdatedRecord = () => {
    switch (action.type) {
      case 'Approve':
        return approveRecord({ uid, record });
      case 'Deny':
        return denyRecord({ uid, record });
      case 'Merge':
        return mergeRecord({ uid, record });
      case 'Convert':
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
        handleRedirect(data?.id);
        refresh();
      })
      .catch((error) => {
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
    action.executeAction({
      ...(action?.type === 'Combine'
        ? { primaryWordId: idValue }
        : action?.type === 'AssignEditingGroup'
          ? { groupNumber: idValue }
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
        push(`/${resource}`);
        refresh();
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: `Error: ${error.response.data.error}`,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      });
  };

  const handleConfirm = (): void => {
    if (action?.type === 'Combine' || action?.type === 'AssignEditingGroup') {
      provideInputValueUponSubmit();
    } else {
      handleClick();
    }
    setIsConfirmOpen(false);
    onClose();
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
      confirm={action?.type}
      cancel="Cancel"
      onConfirm={handleConfirm}
      confirmColorScheme={determineConfirmColorScheme()}
      onClose={() => {
        setIsConfirmOpen(false);
        onClose();
      }}
    >
      {action?.content}
      {action?.type === 'Combine' ? (
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
      {action?.type === 'AssignEditingGroup' ? (
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
    </ConfirmModal>
  );
};

export default connect(null, {
  push,
})(Confirmation);
