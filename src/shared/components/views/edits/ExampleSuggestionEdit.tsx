import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { useEditController } from 'react-admin';
import View from 'src/shared/constants/Views';
import { HistoryProps } from 'src/shared/interfaces';
import Collection from 'src/shared/constants/Collections';
import {
  ExampleEditForm,
  EditDocumentStats,
  EditDocumentIds,
  EditDocumentTopBar,
} from '../components';

const ExampleSuggestionEdit = (props: HistoryProps): ReactElement => {
  const { history } = props;
  const {
    resource,
    record,
    save,
    setOnFailure,
  } = useEditController(props);
  const {
    id,
    originalExampleId,
    approvals,
    denials,
  } = record || {
    id: null,
    originalExampleId: null,
    approvals: [],
    denials: [],
  };
  const isPreExistingSuggestion = history.location?.state?.isPreExistingSuggestion || false;

  // Necessary in order to use the save's onFailure callback
  setOnFailure(() => {});

  return record ? (
    <Box className="bg-white shadow-sm p-10 mt-10">
      <EditDocumentTopBar
        record={record}
        resource={resource}
        view={View.EDIT}
        title="Edit Example Suggestion"
        id={id}
      />
      <Box className="flex flex-col lg:flex-row flex-auto justify-between items-start lg:items-center">
        <EditDocumentIds
          collection={Collection.EXAMPLES}
          originalId={originalExampleId}
          id={id}
          title="Parent Example Id:"
        />
        <EditDocumentStats approvals={approvals} denials={denials} />
      </Box>
      {record ? (
        <ExampleEditForm
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

export default ExampleSuggestionEdit;
