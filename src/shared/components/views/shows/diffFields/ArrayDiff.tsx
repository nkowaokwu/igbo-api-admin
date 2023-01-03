import React, { ReactElement } from 'react';
import DiffField from './DiffField';

const ArrayDiff = (
  {
    recordField,
    value,
    index,
    diffRecord,
    renderNestedObject,
  } : {
    recordField?: string,
    value?: any,
    index?: number,
    diffRecord: any,
    renderNestedObject?: ((value: any, hasChanged: boolean) => ReactElement | ReactElement[]),
  },
): ReactElement => (
  <DiffField
    path={`${recordField}.${index}`}
    diffRecord={diffRecord}
    fallbackValue={value}
    renderNestedObject={renderNestedObject}
  />
);

ArrayDiff.defaultProps = {
  renderNestedObject: null,
};

export default ArrayDiff;
