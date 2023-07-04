import React, { ReactElement } from 'react';
import { ShowProps, useShowController } from 'react-admin';
import { Box, Heading, Text } from '@chakra-ui/react';
import { DEFAULT_NSIBIDI_CHARACTER_RECORD } from 'src/shared/constants';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collections';
import ResolvedNsibidiCharacter from 'src/shared/components/ResolvedNsibidiCharacter';
import DiffField from '../diffFields/DiffField';
import ArrayDiffField from '../diffFields/ArrayDiffField';
import ArrayDiff from '../diffFields/ArrayDiff';
import { DocumentIds, EditDocumentTopBar } from '../../components';

const NsibidiCharacterShow = (props: ShowProps): ReactElement => {
  const { record, resource } = useShowController(props);
  const { permissions } = props;
  const { id, nsibidi, pronunciation, wordClass } = record || DEFAULT_NSIBIDI_CHARACTER_RECORD;

  const resourceTitle = {
    nsibidiCharacters: 'Nsịbịdị Character',
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
          <DocumentIds collection={Collection.EXAMPLES} record={record} id={id} />
          <Box>
            <Heading fontSize="lg" className="text-xl text-gray-600">
              Nsịbịdị
            </Heading>
            <DiffField
              path="nsibidi"
              diffRecord={{}}
              fallbackValue={nsibidi}
              renderNestedObject={(value) => <span className="akagu">{String(value || false)}</span>}
            />
            <Heading fontSize="lg" className="text-xl text-gray-600">
              Pronunciation
            </Heading>
            <DiffField
              path="pronunciation"
              diffRecord={{}}
              fallbackValue={pronunciation}
              renderNestedObject={(value) => <span>{String(value || false)}</span>}
            />
            <Heading fontSize="lg" className="text-xl text-gray-600">
              Part of Speech
            </Heading>
            <DiffField
              path="wordClass"
              diffRecord={{}}
              fallbackValue={wordClass}
              renderNestedObject={(value) => <span className="akagu">{String(value || false)}</span>}
            />
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">
                Definitions
              </Heading>
              <ArrayDiffField recordField="definitions" record={record}>
                <ArrayDiff diffRecord={{}} renderNestedObject={(definition) => <Text>{definition.text}</Text>} />
              </ArrayDiffField>
            </Box>
            <Box className="flex flex-col mt-5">
              <Heading fontSize="lg" className="text-xl text-gray-600">
                Radicals
              </Heading>
              <ArrayDiffField recordField="radicals" record={record}>
                <ArrayDiff
                  diffRecord={{}}
                  renderNestedObject={(radical) => <ResolvedNsibidiCharacter nsibidiCharacterId={radical.id} />}
                />
              </ArrayDiffField>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default NsibidiCharacterShow;
