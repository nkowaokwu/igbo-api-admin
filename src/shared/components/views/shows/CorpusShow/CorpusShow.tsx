import React, { ReactElement, useState, useEffect } from 'react';
import { ShowProps, useShowController } from 'react-admin';
import { Box, Skeleton } from '@chakra-ui/react';
import { LuFileAudio, LuFileType } from 'react-icons/lu';
import diff from 'deep-diff';
import ReactPlayer from 'react-player';
import { DEFAULT_WORD_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collection';
import { getWord } from 'src/shared/API';
import DocumentStats from 'src/shared/components/views/edits/components/DocumentStats';
import ShowTextRenderer from 'src/shared/components/views/components/ShowDocumentStats/component/ShowTextRenderer';
import { EditDocumentTopBar, ShowDocumentStats, Comments } from '../../components';
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

  const { id, title, editorsNotes, userComments, media, originalWordId } = record;

  const resourceTitle = {
    [Collection.CORPUS_SUGGESTIONS]: 'Corpus Suggestion',
    [Collection.CORPORA]: 'Corpus',
  };

  /* Grabs the original word if it exists */
  useEffect(() => {
    (async () => {
      try {
        const originalWord = record?.originalWordId
          ? await getWord(record.originalWordId).catch(() => {
              // Unable to retrieve word
              // console.log(err);
            })
          : null;
        const differenceRecord = diff(originalWord, record, (_, key) => DIFF_FILTER_KEYS.indexOf(key) > -1);
        setDiffRecord(differenceRecord);
      } catch (err) {
        // console.log(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [record]);

  return (
    <Skeleton isLoaded={!isLoading}>
      <Box className="shadow-sm p-4 lg:p-10">
        <EditDocumentTopBar
          record={record}
          resource={resource}
          view={View.SHOW}
          id={id}
          permissions={permissions}
          title={resourceTitle[resource]}
        />
        <ShowDocumentStats record={record} collection={Collection.CORPORA} showFull={resource !== Collection.CORPORA} />
        <Box className="flex flex-col flex-auto justify-between items-start space-y-4 mr-4">
          <Box className="w-full flex flex-col lg:flex-row justify-between items-center">
            <DocumentStats
              collection={Collection.WORDS}
              originalId={originalWordId}
              record={record}
              id={id}
              title="Parent Word Id:"
            />
          </Box>
          <ShowTextRenderer title="Title" icon={<LuFileType />}>
            <DiffField path="title" diffRecord={diffRecord} fallbackValue={title} />
          </ShowTextRenderer>
          <ShowTextRenderer title="Media" icon={<LuFileAudio />}>
            <DiffField
              path="word"
              diffRecord={diffRecord}
              fallbackValue={
                media ? (
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
                ) : (
                  <span>No media</span>
                )
              }
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
          </ShowTextRenderer>
          {resource !== Collection.CORPORA ? (
            <Comments editorsNotes={editorsNotes} userComments={userComments} showUserComments={false} />
          ) : null}
        </Box>
      </Box>
    </Skeleton>
  );
};

export default CorpusShow;
