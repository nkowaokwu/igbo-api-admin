import React, { ReactElement, useEffect, useState } from 'react';
import { Record, ShowProps, useShowController } from 'react-admin';
import {
  Box,
  Heading,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import diff from 'deep-diff';
import ReactAudioPlayer from 'react-audio-player';
import { DEFAULT_EXAMPLE_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collections from 'src/shared/constants/Collections';
import { getExample } from 'src/shared/API';
import SourceField from 'src/shared/components/SourceField';
import ResolvedWord from 'src/shared/components/ResolvedWord/ResolvedWord';
import isResourceSuggestion from 'src/shared/utils/isResourceSuggestion';
import {
  ShowDocumentStats,
  EditDocumentIds,
  EditDocumentTopBar,
  Comments,
} from '../../components';
import { determineDate } from '../../utils';
import ArrayDiffField from '../diffFields/ArrayDiffField';
import ArrayDiff from '../diffFields/ArrayDiff';
import ExampleTableContainer from './ExampleTableContainer';

const ExampleShow = (props: ShowProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [, setOriginalExampleRecord] = useState({});
  const [diffRecord, setDiffRecord] = useState(null);
  const { record, resource } = useShowController(props) as { record: Record, resource: Collections };
  const isSuggestion = isResourceSuggestion(resource);
  const { permissions } = props;
  const {
    id,
    author,
    approvals,
    denials,
    merged,
    igbo,
    english,
    meaning,
    nsibidi,
    style,
    editorsNotes,
    userComments,
    associatedWords,
    originalExampleId,
    updatedAt,
  } = record || DEFAULT_EXAMPLE_RECORD;

  const DIFF_FILTER_KEYS = [
    'id',
    'approvals',
    'denials',
    'merged',
    'author',
    'authorId',
    'authorEmail',
    'userComments',
    'editorsNotes',
    'originalWordId',
    'id',
    'updatedAt',
    'stems',
    'normalized',
    'mergedBy',
  ];

  const resourceTitle = {
    exampleSuggestions: 'Example Suggestion',
    examples: 'Example',
  };

  /* Grabs the original word if it exists */
  useEffect(() => {
    (async () => {
      const originalExample = record?.originalExampleId ? await getExample(record.originalExampleId) : null;
      const differenceRecord = diff(originalExample, record, (_, key) => DIFF_FILTER_KEYS.indexOf(key) > -1);
      setOriginalExampleRecord(originalExample);
      setDiffRecord(differenceRecord);
      setIsLoading(false);
    })();
  }, [record]);

  return (
    <Skeleton isLoaded={!isLoading}>

      <Box className="bg-white shadow-sm py-4 px-10">
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
            <h3 className="text-gray-700">
              {`Last Updated: ${determineDate(updatedAt)}`}
            </h3>
            <EditDocumentIds
              collection={Collections.EXAMPLES}
              originalId={originalExampleId}
              id={id}
              title="Parent Example Id:"
            />
            <Box
              className="w-full flex flex-col lg:flex-row justify-between
              items-start space-y-0 lg:space-y-0 lg:space-x-4"
            >
              <ExampleTableContainer
                diffRecord={diffRecord}
                igbo={igbo}
                english={english}
                meaning={meaning}
                nsibidi={nsibidi}
                style={style}
              />
              <Box className="flex flex-col mt-5">
                <Heading fontSize="lg" className="text-gray-600">Audio Pronunciations</Heading>
                <ArrayDiffField
                  recordField="pronunciations"
                  record={record}
                >
                  <ArrayDiff
                    diffRecord={diffRecord}
                    renderNestedObject={(pronunciation) => (
                      <ReactAudioPlayer
                        src={pronunciation?.audio}
                        style={{ height: '40px', width: '250px' }}
                        controls
                      />
                    )}
                  />
                </ArrayDiffField>
                <Box className="flex flex-col mt-5">
                  <Heading fontWeight="bold" fontSize="lg" className="text-gray-600">Associated Words</Heading>
                  {associatedWords?.length ? associatedWords?.map((associatedWord, index) => (
                    <Box className="flex flex-row items-center space-x-2">
                      <Text>{`${index + 1}. `}</Text>
                      <ResolvedWord key={associatedWord} wordId={associatedWord} isSuggestion={isSuggestion} />
                    </Box>
                  )) : <span className="text-gray-500 italic">No associated word Ids</span>}
                </Box>
              </Box>
            </Box>
            {resource !== Collections.EXAMPLES ? (
              <Comments editorsNotes={editorsNotes} userComments={userComments} />
            ) : null}
          </Box>
          {resource !== Collections.EXAMPLES && (
            <Box className="mb-10 lg:mb-0 flex flex-col items-end">
              <SourceField record={record} source="source" />
              <ShowDocumentStats
                approvals={approvals}
                denials={denials}
                merged={merged}
                author={author}
                collection={Collections.EXAMPLES}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Skeleton>
  );
};

export default ExampleShow;
