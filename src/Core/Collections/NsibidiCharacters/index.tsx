import React, { ReactElement } from 'react';
import { Record } from 'react-admin';
import { Text, chakra } from '@chakra-ui/react';

export const NsibidiCharacterTitle = ({ record }: Record): ReactElement => (
  <Text>
    {'Nsịbịdị Character '}
    <chakra.span>{record ? `"${record.nsibidi}"` : ''}</chakra.span>
  </Text>
);
