import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Record } from 'react-admin';
import { Button } from '@chakra-ui/react';
import openNotification from 'src/Core/Layout/components/Notifications/utils/openNotification';

const ShowNotificationButtonField = ({ source, record }: { source: string; record: Record }): ReactElement => {
  const handleViewNotification = async () => {
    const created_at = `${get(record, 'created_at')}`;
    const recipient = get(record, 'recipient');
    const link = get(record, 'link');
    await openNotification({ id: created_at, recipient, link });
    window.location.hash = get(record, source);
  };

  return (
    <Button onClick={handleViewNotification} colorScheme="purple" aria-label="Create">
      View
    </Button>
  );
};

export default ShowNotificationButtonField;
