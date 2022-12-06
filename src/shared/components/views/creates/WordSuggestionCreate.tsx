import React, { ReactElement } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { useCreateController } from 'react-admin';
import View from 'src/shared/constants/Views';
import { HistoryProps } from 'src/shared/interfaces';
import { WordEditForm } from '../components';

const WordSuggestionCreate = (props: HistoryProps): ReactElement => {
  const createControllerValues = useCreateController(props);
  const { history } = props;
  const { resource, save } = createControllerValues;
  const record = createControllerValues.record?.id
    ? createControllerValues.record
    : history.location?.state?.record || {};
  const isPreExistingSuggestion = history.location?.state?.isPreExistingSuggestion || false;

  return (
    <Box className="bg-white shadow-sm p-10 mt-10">
      <Heading as="h1" className="text-3xl text-gray-800 mb-3" fontFamily="Silka">Create New Word Suggestion</Heading>
      {record ? (
        <WordEditForm
          view={View.CREATE}
          record={record}
          resource={resource}
          save={save}
          history={history}
          isPreExistingSuggestion={isPreExistingSuggestion}
        />
      ) : null}
    </Box>
  );
};

export default WordSuggestionCreate;
