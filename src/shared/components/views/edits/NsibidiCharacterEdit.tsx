import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { useEditController } from 'react-admin';
import View from 'src/shared/constants/Views';
import Collections from 'src/shared/constants/Collections';
import { HistoryProps } from 'src/shared/interfaces';
import { DocumentIds, EditDocumentTopBar, NsibidiCharacterEditForm } from '../components';

const NsibidiCharacterEdit = (props: HistoryProps): ReactElement => {
  const { history } = props;
  const {
    resource,
    record,
    save,
    setOnFailure,
  } = useEditController(props);
  const { id } = record || {
    id: null,
    originalWordId: null,
    approvals: [],
    denials: [],
  };

  // Necessary in order to use the save's onFailure callback
  setOnFailure(() => {});

  return record ? (
    <Box className="bg-white shadow-sm p-10 mt-10">
      <EditDocumentTopBar
        record={record}
        resource={resource}
        view={View.EDIT}
        title="Edit Nsịbịdị Character"
        id={id}
      />
      <Box className="flex flex-col lg:flex-row flex-auto justify-between items-start lg:items-center">
        <DocumentIds
          collection={Collections.WORDS}
          record={record}
          id={id}
          title="Parent Word Id:"
        />
      </Box>
      {record ? (
        <NsibidiCharacterEditForm
          view={View.EDIT}
          resource={resource}
          record={record}
          save={save}
          history={history}
        />
      ) : null}
    </Box>
  ) : null;
};

export default NsibidiCharacterEdit;
