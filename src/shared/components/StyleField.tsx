import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Badge, Tooltip } from '@chakra-ui/react';
import { Record } from 'react-admin';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

const StyleField = ({
  record = { id: null },
  source,
} : {
  label?: string,
  record?: Record,
  source: string,
}): ReactElement => {
  const style = Object.values(ExampleStyle).find(({ value }) => value === get(record, source));

  return (
    <Tooltip label={style.description}>
      <Badge cursor="default" variant="outline" colorScheme={style.colorScheme}>
        {style.label}
      </Badge>
    </Tooltip>
  );
};

StyleField.defaultProps = {
  record: { id: null },
};

export default StyleField;
