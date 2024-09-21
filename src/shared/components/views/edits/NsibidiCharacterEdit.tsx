import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { useEditController } from 'react-admin';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collection';
import { HistoryProps } from 'src/shared/interfaces';
import DocumentStats from 'src/shared/components/views/edits/components/DocumentStats';
import { EditDocumentTopBar, NsibidiCharacterEditForm } from '../components';

const NsibidiCharacterEdit = (props: HistoryProps): ReactElement => {
  const { history } = props;
  const { resource, record, save, setOnFailure } = useEditController(props);
  const { id } = record || {
    id: null,
    originalWordId: null,
    approvals: [],
    denials: [],
  };

  // Necessary in order to use the save's onFailure callback
  setOnFailure(() => {});

  return record ? (
    <Box className="shadow-sm p-4 lg:p-10">
      <EditDocumentTopBar record={record} resource={resource} view={View.EDIT} title="Edit Nsịbịdị Character" id={id} />
      <DocumentStats collection={Collection.NSIBIDI_CHARACTERS} record={record} id={id} />
      {record ? (
        <NsibidiCharacterEditForm view={View.EDIT} resource={resource} record={record} save={save} history={history} />
      ) : null}
    </Box>
  ) : null;
};

export default NsibidiCharacterEdit;
