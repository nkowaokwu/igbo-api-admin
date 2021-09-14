import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { merge } from 'lodash';
import Dialects from '../../../../../../../backend/shared/constants/Dialects';
import DialectForm from '../../DialectForm/DialectForm';
import CurrentDialectFormsInterface from './CurrentDialectFormsInterface';

const CurrentDialectsForms = ({
  currentDialectView,
  watchDialects,
  record,
  originalRecord,
  control,
  getValues,
  setValue,
  updateSelectedDialects,
}: CurrentDialectFormsInterface): ReactElement => {
  const formData = getValues();
  return (
    <Box
      className={
        `${currentDialectView.length === 1
          ? ''
          : 'w-full grid grid-flow-row grid-cols-1 lg:grid-cols-3 gap-4 px-3'}`
      }
    >
      {Object.values(merge(record.dialects, watchDialects)).map(({ dialect }) => {
        const { label: dialectLabel } = Dialects[dialect];
        return (
          <Box
            key={dialect}
            style={{
              display: currentDialectView.length !== 0 && !currentDialectView.includes(dialect)
                ? 'none'
                : 'block',
            }}
          >
            <DialectForm
              dialect={dialect}
              dialectLabel={dialectLabel}
              formData={formData}
              record={record}
              control={control}
              getValues={getValues}
              setValue={setValue}
              updateSelectedDialects={updateSelectedDialects}
              originalRecord={originalRecord}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default CurrentDialectsForms;
