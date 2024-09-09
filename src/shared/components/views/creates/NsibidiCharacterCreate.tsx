import React, { ReactElement } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { useCreateController } from 'react-admin';
import View from 'src/shared/constants/Views';
import { HistoryProps } from 'src/shared/interfaces';
import { NsibidiCharacterEditForm } from '../components';

const NsibidiCharacterCreate = (props: HistoryProps): ReactElement => {
  const createControllerValues = useCreateController(props);
  const { history } = props;
  const { resource, save } = createControllerValues;
  const record = createControllerValues.record?.id
    ? createControllerValues.record
    : history.location?.state?.record || {};

  return (
    <Box className="shadow-sm p-4 lg:p-10">
      <Heading as="h1" className="text-3xl text-gray-800 mb-3" fontFamily="Silka">
        Create New Nsịbịdị Character
      </Heading>
      {record ? (
        <NsibidiCharacterEditForm
          view={View.CREATE}
          record={record}
          resource={resource}
          save={save}
          history={history}
        />
      ) : null}
    </Box>
  );
};

export default NsibidiCharacterCreate;
