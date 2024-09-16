import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { ShowProps, useShowController } from 'react-admin';
import { Box, Text, VStack } from '@chakra-ui/react';
import { DEFAULT_NSIBIDI_CHARACTER_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collection';
import ResolvedNsibidiCharacter from 'src/shared/components/ResolvedNsibidiCharacter';
import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';
import LegacyAkaguFont from 'src/backend/shared/constants/LegacyAkaguFont';
import DocumentStats from 'src/shared/components/views/edits/components/DocumentStats';
import ShowTextRenderer from 'src/shared/components/views/components/ShowDocumentStats/component/ShowTextRenderer';
import { LuArchive, LuFileAudio, LuFileType, LuPin, LuRatio } from 'react-icons/lu';
import DiffField from '../diffFields/DiffField';
import ArrayDiffField from '../diffFields/ArrayDiffField';
import ArrayDiff from '../diffFields/ArrayDiff';
import { EditDocumentTopBar } from '../../components';
import Attributes from '../components/Attributes';

const NsibidiCharacterShow = (props: ShowProps): ReactElement => {
  const { record, resource } = useShowController(props);
  const { permissions } = props;
  const { id, nsibidi, pronunciation, wordClass } = record || DEFAULT_NSIBIDI_CHARACTER_RECORD;

  const resourceTitle = {
    nsibidiCharacters: 'Nsịbịdị Character',
  };

  return (
    <Box className="shadow-sm p-4 lg:p-10">
      <EditDocumentTopBar
        record={record}
        resource={resource}
        view={View.SHOW}
        id={id}
        permissions={permissions}
        title={resourceTitle[resource]}
      />
      <Box className="flex flex-col-reverse lg:flex-row mt-1">
        <Box className="flex flex-col flex-auto justify-between items-start">
          <DocumentStats collection={Collection.EXAMPLES} record={record} id={id} />
          <VStack alignItems="start" width="full" gap={2}>
            <Attributes
              attributeType={Collection.NSIBIDI_CHARACTERS}
              title="Nsịbịdị Character Attributes"
              record={record}
            />
            <ShowTextRenderer title="Nsịbịdị" icon={<>〒</>}>
              <DiffField
                path="nsibidi"
                diffRecord={{}}
                fallbackValue={nsibidi}
                renderNestedObject={(value) => <span className="akagu">{String(value || false)}</span>}
              />
            </ShowTextRenderer>
            <ShowTextRenderer title="Pronunciation" icon={<LuFileAudio />}>
              <DiffField
                path="pronunciation"
                diffRecord={{}}
                fallbackValue={pronunciation}
                renderNestedObject={(value) => <span>{String(value || false)}</span>}
              />
            </ShowTextRenderer>
            <ShowTextRenderer title="Part of Speech" icon={<LuRatio />}>
              <DiffField
                path="wordClass"
                diffRecord={{}}
                fallbackValue={wordClass}
                renderNestedObject={(value) => <span className="akagu">{String(value || false)}</span>}
              />
            </ShowTextRenderer>
            <ShowTextRenderer title="Definitions" icon={<LuFileType />}>
              <ArrayDiffField recordField="definitions" record={record}>
                <ArrayDiff diffRecord={{}} renderNestedObject={(definition) => <Text>{definition.text}</Text>} />
              </ArrayDiffField>
            </ShowTextRenderer>
            <ShowTextRenderer title="Radicals" icon={<LuPin />}>
              <ArrayDiffField recordField="radicals" record={record}>
                <ArrayDiff
                  diffRecord={{}}
                  renderNestedObject={(radical) => <ResolvedNsibidiCharacter nsibidiCharacterId={radical.id} />}
                />
              </ArrayDiffField>
            </ShowTextRenderer>
            {get(record, `attributes.${NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS}`) ? (
              <ShowTextRenderer title="Legacy characters" icon={<LuArchive />}>
                <DiffField
                  path="nsibidi"
                  diffRecord={{}}
                  fallbackValue={nsibidi}
                  renderNestedObject={(value) =>
                    Object.values(LegacyAkaguFont).map((fontVersion) => (
                      <span className={fontVersion}>{String(value || false)}</span>
                    ))
                  }
                />
              </ShowTextRenderer>
            ) : null}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default NsibidiCharacterShow;
