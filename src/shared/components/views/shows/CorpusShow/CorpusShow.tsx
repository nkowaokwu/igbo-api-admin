import React, { ReactElement, useState, useEffect } from 'react';
import { ShowProps, useShowController } from 'react-admin';
import { Box, Heading, Skeleton } from '@chakra-ui/react';
import diff from 'deep-diff';
import ReactPlayer from 'react-player';
import { DEFAULT_WORD_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collections';
import { getWord } from 'src/shared/API';
import SourceField from 'src/shared/components/SourceField';
import {
  EditDocumentTopBar,
  ShowDocumentStats,
  EditDocumentIds,
  Comments,
} from '../../components';
import { determineDate } from '../../utils';
import DiffField from '../diffFields/DiffField';

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

const CorpusShow = (props: ShowProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [diffRecord, setDiffRecord] = useState(null);
  const showProps = useShowController(props);
  const { resource } = showProps;
  let { record } = showProps;
  const { permissions } = props;

  record = record || DEFAULT_WORD_RECORD;

  const {
    id,
    author,
    title,
    editorsNotes,
    userComments,
    merged,
    media,
    approvals,
    denials,
    originalWordId,
    updatedAt,
  } = record;

  const resourceTitle = {
    [Collection.CORPUS_SUGGESTIONS]: 'Corpus Suggestion',
    [Collection.CORPORA]: 'Corpus',
  };

  /* Grabs the original word if it exists */
  useEffect(() => {
    (async () => {
      try {
        const originalWord = record?.originalWordId ? await getWord(record.originalWordId).catch((err) => {
          // Unable to retrieve word
          console.log(err);
        }) : null;
        const differenceRecord = diff(originalWord, record, (_, key) => DIFF_FILTER_KEYS.indexOf(key) > -1);
        setDiffRecord(differenceRecord);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
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
        <Box className="flex flex-col lg:flex-row mb-1">
          <Box className="flex flex-col flex-auto justify-between items-start space-y-4 mr-4">
            <Box className="w-full flex flex-col lg:flex-row justify-between items-center">
              <Box>
                <Heading fontSize="lg" className="text-xl text-gray-700">
                  <>
                    {'Last Updated: '}
                    {determineDate(updatedAt)}
                  </>
                </Heading>
                <EditDocumentIds
                  collection={Collection.WORDS}
                  originalId={originalWordId}
                  id={id}
                  title="Parent Word Id:"
                />
              </Box>
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">Title</Heading>
              <DiffField
                path="title"
                diffRecord={diffRecord}
                fallbackValue={title}
              />
            </Box>
            <Box className="w-full flex flex-col space-y-3">
              <Box className="flex flex-col">
                <Heading fontSize="lg" className="text-xl text-gray-600">Media</Heading>
                {/* TODO: check this part! */}
                <DiffField
                  path="word"
                  diffRecord={diffRecord}
                  fallbackValue={media ? (
                    <ReactPlayer
                      url={media}
                      controls
                      width="50%"
                      height="50px"
                      style={{
                        overflow: 'hidden',
                        height: '50px !important',
                      }}
                      config={{
                        file: {
                          forceAudio: true,
                        },
                      }}
                    />
                  ) : <span>No media</span>}
                  renderNestedObject={() => (
                    <ReactPlayer
                      url={media}
                      controls
                      width="50%"
                      height="50px"
                      style={{
                        overflow: 'hidden',
                        height: '50px !important',
                      }}
                      config={{
                        file: {
                          forceAudio: true,
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
            {resource !== Collection.CORPORA ? (
              <Comments editorsNotes={editorsNotes} userComments={userComments} showUserComments={false} />
            ) : null}
          </Box>
          <Box className="mb-10 lg:mb-0 space-y-3 flex flex-col items-start">
            {resource !== Collection.CORPORA && (
              <>
                <SourceField record={record} source="source" />
                <ShowDocumentStats
                  approvals={approvals}
                  denials={denials}
                  merged={merged}
                  author={author}
                  collection={Collection.CORPORA}
                />
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Skeleton>
  );
};

export default CorpusShow;
