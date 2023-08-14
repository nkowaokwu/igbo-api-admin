import { chakra } from '@chakra-ui/react';
import React from 'react';

type Props = {
  Icon: React.ReactNode;
  title: string;
};

export const LeaderboardItem: React.FC<Props> = ({ Icon, title }) => (
  <>
    <chakra.label>{title}</chakra.label>
    <chakra.span position="absolute" bottom={0} right={0} padding={2}>
      {Icon}
    </chakra.span>
  </>
);
