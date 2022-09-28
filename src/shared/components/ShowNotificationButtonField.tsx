import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Record } from 'react-admin';
import { Button } from '@chakra-ui/react';

const ShowNotificationButtonField = ({ source, record } : { source: string, record: Record }): ReactElement => (
  <Button
    onClick={() => {
      window.location.hash = get(record, source);
    }}
    colorScheme="green"
    aria-label="Create"
  >
    Show
  </Button>
);

export default ShowNotificationButtonField;
