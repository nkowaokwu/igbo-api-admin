import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { useEditController } from 'react-admin';
import View from 'src/shared/constants/Views';
import { HistoryProps } from 'src/shared/interfaces';
import Collection from 'src/shared/constants/Collection';
import DocumentStats from 'src/shared/components/views/edits/components/DocumentStats';
import { CorpusEditForm, EditDocumentTopBar } from '../components';

const CorpusSuggestionEdit = (props: HistoryProps): ReactElement => {
  const { history } = props;
  const { resource, record, save, setOnFailure } = useEditController(props);
  const { id, originalCorpusId, approvals, denials } = record || {
    id: null,
    originalCorpusId: null,
    approvals: [],
    denials: [],
  };
  const isPreExistingSuggestion = history.location?.state?.isPreExistingSuggestion || false;

  // Necessary in order to use the save's onFailure callback
  setOnFailure(() => {});

  return record ? (
    <Box className="bg-white shadow-sm lg:px-10 mt-10">
      <EditDocumentTopBar record={record} resource={resource} view={View.EDIT} title="Edit Corpus Suggestion" id={id} />
      <DocumentStats
        collection={Collection.CORPORA}
        originalId={originalCorpusId}
        record={record}
        id={id}
        title="Parent Corpus Id:"
        approvals={approvals}
        denials={denials}
      />
      {record ? (
        <CorpusEditForm
          view={View.EDIT}
          record={record}
          resource={resource}
          save={save}
          history={history}
          isPreExistingSuggestion={isPreExistingSuggestion}
        />
      ) : null}
    </Box>
  ) : null;
};

export default CorpusSuggestionEdit;
