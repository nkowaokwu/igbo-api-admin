import React, { ReactElement } from 'react';
import { ShowProps, useShowController } from 'react-admin';
import { Box, Text } from '@chakra-ui/react';
import { DEFAULT_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collections';
import {
  ShowDocumentStats,
  EditDocumentIds,
  EditDocumentTopBar,
  Comments,
} from '../components';
import { determineDate } from '../utils';
import ResolvedWord from '../../ResolvedWord';

const ExampleShow = (props: ShowProps): ReactElement => {
  const { record, resource } = useShowController(props);
  const { permissions } = props;
  const {
    id,
    author,
    approvals,
    denials,
    merged,
    igbo,
    english,
    editorsNotes,
    userComments,
    associatedWords,
    originalExampleId,
    updatedOn,
  } = record || DEFAULT_RECORD;

  const resourceTitle = {
    exampleSuggestions: 'Example Suggestion',
    examples: 'Example',
  };

  return (
    <Box className="bg-white shadow-sm p-10 mt-10">
      <EditDocumentTopBar
        record={record}
        resource={resource}
        view={View.SHOW}
        id={id}
        permissions={permissions}
        title={`${resourceTitle[resource]} Document Details`}
      />
      <Box className="flex flex-col-reverse lg:flex-row mt-1">
        <Box className="flex flex-col flex-auto justify-between items-start">
          <h3 className="text-xl text-gray-700">
            {'Last Updated: '}
            {determineDate(updatedOn)}
          </h3>
          <EditDocumentIds collection="examples" originalId={originalExampleId} id={id} title="Origin Example Id:" />
          <Box>
            <Box className="flex flex-col mt-5">
              <Text fontWeight="bold" className="text-xl text-gray-600">Igbo</Text>
              <Text className="text-2xl text-gray-800">{igbo}</Text>
            </Box>
            <Box className="flex flex-col mt-5">
              <Text fontWeight="bold" className="text-xl text-gray-600">English</Text>
              <Text className="text-2xl text-gray-800">{english}</Text>
            </Box>
            <Box className="flex flex-col mt-5">
              <Text fontWeight="bold" className="text-xl text-gray-600">Associated Words</Text>
              {associatedWords?.length ? associatedWords?.map((associatedWord, index) => (
                <Box className="flex flex-row items-center space-x-2">
                  <Text>{`${index + 1}. `}</Text>
                  <ResolvedWord key={associatedWord} wordId={associatedWord} />
                </Box>
              )) : <span className="text-gray-500 italic">No associated word Ids</span>}
            </Box>
            {resource !== Collection.EXAMPLES ? (
              <Comments editorsNotes={editorsNotes} userComments={userComments} />
            ) : null}
          </Box>
        </Box>
        {resource !== Collection.EXAMPLES && (
          <Box className="mb-10 lg:mb-0">
            <ShowDocumentStats
              approvals={approvals}
              denials={denials}
              merged={merged}
              author={author}
              collection="examples"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExampleShow;
