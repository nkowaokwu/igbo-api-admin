import React, { ReactElement } from 'react';
import { useCreateController } from 'react-admin';
import View from '../../../constants/Views';
import { HistoryProps } from '../../../interfaces';
import { ExampleEditForm } from '../components';

const ExampleSuggestionCreate = (props: HistoryProps): ReactElement => {
  const createControllerValues = useCreateController(props);
  const { history } = props;
  const { resource, save } = createControllerValues;
  const record = createControllerValues.record?.id
    ? createControllerValues.record
    : history.location?.state?.record || {};
  const isPreExistingSuggestion = history.location?.state?.isPreExistingSuggestion || false;

  return (
    <div className="bg-white shadow-sm p-10 mt-10">
      <h1 className="text-3xl text-gray-800 mb-3">Create New Example Suggestion</h1>
      {record ? (
        <ExampleEditForm
          view={View.CREATE}
          record={record}
          save={save}
          resource={resource}
          history={history}
          isPreExistingSuggestion={isPreExistingSuggestion}
        />
      ) : null}
    </div>
  );
};

export default ExampleSuggestionCreate;
