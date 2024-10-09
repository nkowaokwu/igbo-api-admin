import React, { ReactElement } from 'react';
import PropTypes from 'prop-types';
import { useListContext } from 'react-admin';
import { Box, Heading, Text } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { startCase } from 'lodash';
import { CreateButton } from 'src/shared/primitives';
import Collection from 'src/shared/constants/Collection';

const emptyMap = {
  [Collection.WORDS]: 'Words',
  [Collection.WORD_SUGGESTIONS]: 'Word Drafts',
  [Collection.EXAMPLES]: 'Sentences',
  [Collection.EXAMPLE_SUGGESTIONS]: 'Sentence Drafts',
};

const Empty = ({ showCreate }: { showCreate: boolean }): ReactElement => {
  const { basePath, resource } = useListContext();
  return (
    <Box className="flex flex-col justify-center items-center text-center pt-6 lg:py-12 lg:px-6">
      <Box className="flex flex-col justify-center items-center w-11/12 lg:w-8/12 lg:space-y-6 h-72">
        <InfoIcon w={12} h={12} color="gray.500" />
        <Box textAlign="center" m={1} className="lg:space-y-2">
          <Heading fontSize="xl" fontFamily="Silka">{`No ${startCase(emptyMap[resource] || resource)}`}</Heading>
          {showCreate ? (
            <>
              <Text fontSize="lg">Create one to get started</Text>
              <CreateButton basePath={basePath} />
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

Empty.propTypes = {
  showCreate: PropTypes.bool,
};

Empty.defaultProps = {
  showCreate: true,
};

export default Empty;
