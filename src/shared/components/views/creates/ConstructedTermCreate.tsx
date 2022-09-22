import React, { ReactElement } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { useCreateController } from 'react-admin';
import View from 'src/shared/constants/Views';
import { HistoryProps } from 'src/shared/interfaces';
import { WordEditForm } from '../components';

const ConstructedTermCreate = (props: HistoryProps): ReactElement => {
  const createControllerValues = useCreateController(props);
  const { history } = props;
  const { resource, save } = createControllerValues;
  const record = createControllerValues.record?.id
    ? createControllerValues.record
    : history.location?.state?.record || {};
  const isPreExistingTerm = history.location?.state?.isPreExistingTerm || false;

  return (
    <Box className="bg-white shadow-sm p-10 mt-10">
      <Heading as="h1" className="text-3xl text-gray-800 mb-3">Create New Constructed Term</Heading>
      {record ? (
        <WordEditForm
          view={View.CREATE}
          record={record}
          resource={resource}
          save={save}
          history={history}
          isConstructedTerm
          isPreExistingSuggestion={isPreExistingTerm}
        />
      ) : null}
    </Box>
  );
};

export default ConstructedTermCreate;
