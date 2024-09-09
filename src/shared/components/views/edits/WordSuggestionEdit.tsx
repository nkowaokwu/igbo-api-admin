import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { useEditController } from 'react-admin';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collection';
import { HistoryProps } from 'src/shared/interfaces';
import DocumentStats from 'src/shared/components/views/edits/components/DocumentStats';
import { WordEditForm, EditDocumentTopBar } from '../components';

const WordSuggestionEdit = (props: HistoryProps): ReactElement => {
  const { history } = props;
  const { resource, record, save, setOnFailure } = useEditController(props);
  const { id, originalWordId, approvals, denials } = record || {
    id: null,
    originalWordId: null,
    approvals: [],
    denials: [],
  };
  const isPreExistingSuggestion = history.location?.state?.isPreExistingSuggestion || false;

  // Necessary in order to use the save's onFailure callback
  setOnFailure(() => {});

  return record ? (
    <Box className="shadow-sm p-4 lg:p-10">
      <EditDocumentTopBar record={record} resource={resource} view={View.EDIT} title="Edit Word Suggestion" id={id} />
      <DocumentStats
        collection={Collection.WORDS}
        originalId={originalWordId}
        record={record}
        id={id}
        title="Parent Word Id:"
        approvals={approvals}
        denials={denials}
      />
      {record ? (
        <WordEditForm
          view={View.EDIT}
          resource={resource}
          record={record}
          save={save}
          history={history}
          isPreExistingSuggestion={isPreExistingSuggestion}
        />
      ) : null}
    </Box>
  ) : null;
};

export default WordSuggestionEdit;
