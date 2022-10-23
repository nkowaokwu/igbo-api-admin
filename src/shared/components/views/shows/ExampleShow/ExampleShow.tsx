import React, { ReactElement, useEffect, useState } from 'react';
import { ShowProps, useShowController } from 'react-admin';
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
import Collection from 'src/shared/constants/Collections';
import { getExample } from 'src/shared/API';
import SourceField from 'src/shared/components/SourceField';
import ResolvedWord from 'src/shared/components/ResolvedWord';
import DiffField from '../diffFields/DiffField';
import {
  ShowDocumentStats,
  EditDocumentIds,
  EditDocumentTopBar,
  Comments,
} from '../../components';
import { determineDate } from '../../utils';

const ExampleShow = (props: ShowProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [, setOriginalExampleRecord] = useState({});
  const [diffRecord, setDiffRecord] = useState(null);
  const { record, resource } = useShowController(props);
  const { permissions } = props;
  const {
    id,
    author,
    approvals,
    denials,
    merged,
    pronunciation,
    igbo,
    english,
    meaning,
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
              {determineDate(updatedAt)}
            </h3>
            <EditDocumentIds
              collection={Collection.EXAMPLES}
              originalId={originalExampleId}
              id={id}
              title="Origin Example Id:"
            />
            <Box>
              <Heading fontSize="lg" className="text-xl text-gray-600">
                Sentence Style
              </Heading>
              <DiffField
                path="style"
                diffRecord={diffRecord}
                fallbackValue={style}
                renderNestedObject={(value) => <span>{String(value || false)}</span>}
              />
              <Box className="flex flex-col mt-5">
                <Heading fontSize="lg" className="text-xl text-gray-600">Audio Pronunciation</Heading>
                {/* TODO: check this part! */}
                <DiffField
                  path="word"
                  diffRecord={diffRecord}
                  fallbackValue={pronunciation ? (
                    <ReactAudioPlayer
                      src={pronunciation}
                      style={{ height: 40, width: 250 }}
                      controls
                    />
                  ) : <span>No audio pronunciation</span>}
                  renderNestedObject={() => (
                    <ReactAudioPlayer
                      src={pronunciation}
                      style={{ height: 40, width: 250 }}
                      controls
                    />
                  )}
                />
              </Box>
              <Heading fontSize="lg" className="text-xl text-gray-600">
                Igbo
              </Heading>
              <DiffField
                path="igbo"
                diffRecord={diffRecord}
                fallbackValue={igbo}
                renderNestedObject={(value) => <span>{String(value || false)}</span>}
              />
              <Heading fontSize="lg" className="text-xl text-gray-600">
                English
              </Heading>
              <DiffField
                path="english"
                diffRecord={diffRecord}
                fallbackValue={english}
                renderNestedObject={(value) => <span>{String(value || false)}</span>}
              />
              <Heading fontSize="lg" className="text-xl text-gray-600">
                Meaning
              </Heading>
              <DiffField
                path="meaning"
                diffRecord={diffRecord}
                fallbackValue={meaning}
                renderNestedObject={(value) => <span>{String(value || false)}</span>}
              />
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
            <Box className="mb-10 lg:mb-0 flex flex-col items-end">
              <SourceField record={record} source="source" />
              <ShowDocumentStats
                approvals={approvals}
                denials={denials}
                merged={merged}
                author={author}
                collection={Collection.EXAMPLES}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Skeleton>
  );
};

export default ExampleShow;
