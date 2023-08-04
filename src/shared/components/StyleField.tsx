import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Badge, Tooltip } from '@chakra-ui/react';
import { Record } from 'react-admin';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';
import ExampleStyleEnum from 'src/backend/shared/constants/ExampleStyleEnum';

const DEFAULT_EXAMPLE_STYLE = {
  value: ExampleStyleEnum.NO_STYLE,
  label: 'No Style',
  description: 'This is a regular, non-Standard example sentence.',
  colorScheme: 'gray',
};

const StyleField = ({
  record = { id: null },
  source,
}: {
  label?: string;
  record?: Record;
  source: string;
}): ReactElement => {
  const style = Object.values(ExampleStyle).find(({ value }) => value === get(record, source)) || DEFAULT_EXAMPLE_STYLE;

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
