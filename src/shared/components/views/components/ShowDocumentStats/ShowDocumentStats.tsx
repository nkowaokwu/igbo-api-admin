import React, { ReactElement } from 'react';
import { map, compact } from 'lodash';
import { Box, Text } from '@chakra-ui/react';
import DocumentStatsInterface from './ShowDocumentStatsInterface';
import Collection from '../../../../constants/Collections';

const ShowDocumentStats = ({
  approvals,
  denials,
  author,
  merged,
  collection,
}: DocumentStatsInterface): ReactElement => {
  const renderUserDisplayNameList = (users: { displayName: string, email: string }[] = []) => (
    map(compact(users), (user = { displayName: '', email: '' }) => (
      <span key={`${user?.displayName}-${user?.email}`}>
        +
        <a className="text-blue-500 underline ml-2" href={`mailto:${user?.email || ''}`}>
          {user?.displayName || 'Unavailable name'}
        </a>
      </span>
    ))
  );
  return (
    <Box className="flex flex-initial items-start mt-3 lg:mt-0">
      <Box className="pl-3">
        <Text fontWeight="bold" className="text-2xl text-gray-800">Document Author:</Text>
        <Text className="text-xl text-gray-800">
          {author?.displayName ? (
            <a className="text-blue-500 underline ml-2" href={`mailto:${author?.email || ''}`}>
              {author.displayName}
            </a>
          ) : 'N/A'}
        </Text>
        <Text fontWeight="bold" className="text-2xl text-gray-800">Document Status:</Text>
        <Box
          className="flex flex-col rounded border border-solid border-gray-200 shadow-md fit-content py-3 px-5"
          style={{ width: 'fit-content' }}
        >
          <Box className="flex flex-col">
            <Box className="flex flex-row">
              <Text fontWeight="bold" className="text-xl text-gray-800 mr-2">Approvals:</Text>
              <Text className="text-xl text-gray-800">{approvals?.length}</Text>
            </Box>
            {approvals?.length ? renderUserDisplayNameList(approvals) : 'No approvals'}
            <Box className="flex flex-row mt-3">
              <Text fontWeight="bold" className="text-xl text-gray-800 mr-2">Denials:</Text>
              <Text className="text-xl text-gray-800">{denials?.length}</Text>
            </Box>
            {denials?.length ? renderUserDisplayNameList(denials) : 'No denials'}
          </Box>
          <Box className="flex items-center mt-3">
            <Text fontWeight="bold" className="text-xl text-gray-800 mr-2">Merge Status:</Text>
            <Text>
              {!!merged ? (
                <span className="text-green-600 text-l">Merged</span>
              ) : (
                <span className="text-red-600 text-l">Not Merged</span>
              )}
            </Text>
          </Box>
          {merged ? (
            <>
              <Text className="mr-3">{`Merged ${collection === Collection.WORDS ? 'word' : 'example'}:`}</Text>
              <a className="link" href={`#/${collection}/${merged}/show`}>{`${collection}/${merged}`}</a>
            </>
          ) : null }
        </Box>
      </Box>
    </Box>
  );
};

export default ShowDocumentStats;
