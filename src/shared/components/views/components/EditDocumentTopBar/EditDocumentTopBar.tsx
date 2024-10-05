import React, { ReactElement } from 'react';
import { Box, Button, Divider, Heading } from '@chakra-ui/react';
import { LuFilePlus } from 'react-icons/lu';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import View from 'src/shared/constants/Views';
import Collection from 'src/shared/constants/Collection';
import { Select } from 'src/shared/components';
import { determineCreateSuggestionRedirection } from 'src/shared/utils';
import DocumentTopBarInterface from './DocumentTopBarInterface';

const CreateSuggestion = ({
  record,
  resource,
  push,
}: {
  record: Record<any, any>;
  resource: string;
  push: (value: any) => void;
}): ReactElement => (
  <Button onClick={() => determineCreateSuggestionRedirection({ record, resource, push })} leftIcon={<LuFilePlus />}>
    Create a draft
  </Button>
);

const EditDocumentTopBar = ({
  resource,
  record,
  view,
  title,
  push,
  permissions,
}: DocumentTopBarInterface): ReactElement => {
  const determineMergeCollection = () =>
    resource === Collection.EXAMPLE_SUGGESTIONS
      ? Collection.EXAMPLES
      : resource === Collection.CORPUS_SUGGESTIONS
      ? Collection.CORPORA
      : Collection.WORDS;
  const shouldShowEditorActions =
    resource !== Collection.EXAMPLES && resource !== Collection.WORDS && resource !== Collection.CORPORA;

  return (
    <Box mb={{ base: 12, lg: 4 }}>
      <Box mb={6}>
        {view === View.EDIT ? (
          <Box className="flex flex-col lg:flex-row lg:justify-between">
            <Heading as="h1" fontSize="3xl" color="gray.800" mb={{ base: 3, lg: 0 }} fontFamily="Silka">
              {title}
            </Heading>
          </Box>
        ) : (
          <Box className="flex flex-col md:flex-row justify-between">
            <Heading as="h1" fontSize="3xl" color="gray.800" mb={{ base: 3, lg: 0 }} fontFamily="Silka">
              {title}
            </Heading>
            {shouldShowEditorActions ? (
              <Box className="flex flex-col mb-5">
                <Select
                  view={View.SHOW}
                  resource={resource}
                  collection={determineMergeCollection()}
                  record={record}
                  permissions={permissions}
                  showButtonLabels
                />
              </Box>
            ) : (
              <CreateSuggestion record={record} resource={resource} push={push} />
            )}
          </Box>
        )}
      </Box>
      <Divider />
    </Box>
  );
};

export default withRouter(
  connect(null, {
    push,
  })(EditDocumentTopBar),
);
