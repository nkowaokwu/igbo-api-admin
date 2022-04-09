import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Badge, Tooltip } from '@chakra-ui/react';
import { Record } from 'react-admin';
import SuggestionSource from 'src/backend/shared/constants/SuggestionSource';

const SourceField = ({ record, source } : { record: Record, source: string }): ReactElement => {
  const value = get(record, source);
  const badgeLabel = value === SuggestionSource.COMMUNITY
    ? 'Nkọwa okwu'
    : 'Igbo API Editor';
  const label = SuggestionSource.COMMUNITY === value
    ? 'This suggestion came from a user on Nkọwa okwu'
    : 'This suggestion came from the internal Igbo API Editor Platform';

  return (
    <Tooltip label={label}>
      <Badge cursor="default" variant="outline" colorScheme={value === SuggestionSource.COMMUNITY ? 'purple' : 'gray'}>
        {badgeLabel}
      </Badge>
    </Tooltip>
  );
};

export default SourceField;
