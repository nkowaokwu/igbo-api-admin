import React, { ReactElement } from 'react';
import { Button } from '@chakra-ui/react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import View from '../../../../constants/Views';
import Collection from '../../../../constants/Collections';
import { Select } from '../../..';
import DocumentTopBarInterface from './DocumentTopBarInterface';
import { determineCreateSuggestionRedirection } from '../../../../utils';

const CreateSuggestion = ({
  record,
  resource,
  push,
}: {
  record: Record<any, any>,
  resource: string,
  push: (value: any) => void,
}): ReactElement => (
  <Button
    colorScheme="teal"
    onClick={() => determineCreateSuggestionRedirection({ record, resource, push })}
  >
    Suggest an Edit
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
  const determineMergeCollection = () => (
    resource === Collection.EXAMPLE_SUGGESTIONS ? Collection.EXAMPLES : Collection.WORDS
  );

  return (
    view === View.EDIT ? (
      <div className="flex flex-col lg:flex-row lg:justify-between">
        <h1 className="text-3xl text-gray-800 mb-3">{title}</h1>
      </div>
    ) : (
      <div className="flex flex-col lg:flex-row justify-between">
        <h1 className="text-3xl text-gray-800 mb-3 lg:mb-0">{title}</h1>
        {resource !== Collection.EXAMPLES && resource !== Collection.WORDS ? (
          <div className="flex flex-col mb-5">
            <h1 className="text-2xl text-gray-800">Editor Actions:</h1>
            <Select
              view={View.SHOW}
              resource={resource}
              collection={determineMergeCollection()}
              record={record}
              permissions={permissions}
              label="Editor's Actions"
            />
          </div>
        ) : (
          <CreateSuggestion
            record={record}
            resource={resource}
            push={push}
          />
        )}
      </div>
    )
  );
};

export default withRouter(connect(null, {
  push,
})(EditDocumentTopBar));
