import React, { ReactElement } from 'react';
import { map, compact } from 'lodash';
import { Avatar, HStack, Link, Text, TextProps, VStack } from '@chakra-ui/react';
import { LuUser2, LuCheckCircle2, LuXCircle, LuSend, LuShovel } from 'react-icons/lu';
import { determineDate } from 'src/shared/components/views/shows/utils';
import OriginField from 'src/shared/components/OriginField';
import DocumentStatsInterface from './ShowDocumentStatsInterface';

interface DocumentStatus {
  label: string;
  icon: ReactElement;
  value: string | ReactElement[];
  href?: string;
  options: TextProps;
}

const renderUserDisplayNameList = (users: { displayName: string; email: string; photoURL: string }[] = []) =>
  map(compact(users), (user = { displayName: '', email: '', photoURL: '' }) => (
    <Link href={`mailto:${user?.email || ''}`}>
      <Avatar size="xs" src={user?.photoURL} name="" />
      {user?.displayName || 'Unavailable name'}
    </Link>
  ));

const ShowDocumentStats = ({ record, showFull }: DocumentStatsInterface): ReactElement => {
  if (!record) return null;

  const { id, originalId, author, approvals, denials, merged, origin, createdAt, updatedAt } = record;

  const documentStatuses: DocumentStatus[] = compact([
    {
      label: 'Document Id',
      icon: <></>,
      value: id,
      options: {},
    },
    showFull && {
      label: 'Parent document Id',
      icon: <></>,
      value: originalId || 'No parent document Id',
      options: {
        color: originalId ? 'gray.400' : '',
      },
    },
    {
      label: 'Author',
      icon: <LuUser2 />,
      value: author?.displayName || 'No author',
      href: `mailto:${author?.email || ''}`,
      options: {
        color: Boolean(author?.displayName) ? 'gray.400' : '',
      },
    },
    {
      label: 'Created on',
      icon: <></>,
      value: determineDate(createdAt),
      options: {},
    },
    {
      label: 'Updated on',
      icon: <></>,
      value: determineDate(updatedAt),
      options: {},
    },
    showFull && {
      label: 'Approvals',
      icon: <LuCheckCircle2 />,
      value: approvals?.length ? renderUserDisplayNameList(approvals) : 'No approvals',
      options: {
        color: Boolean(approvals?.length) ? 'gray.400' : '',
      },
    },
    showFull && {
      label: 'Denials',
      icon: <LuXCircle />,
      value: denials?.length ? renderUserDisplayNameList(denials) : 'No denials',
      options: {
        color: Boolean(denials?.length) ? 'gray.400' : '',
      },
    },
    showFull && {
      label: 'Status',
      icon: <LuSend />,
      value: merged ? 'Merged' : 'Not merged',
      options: {
        color: merged ? 'green.400' : 'red.400',
      },
    },
    showFull && origin
      ? {
          label: 'Origin',
          icon: <LuShovel />,
          value: <OriginField record={record} source="origin" />,
          options: {},
        }
      : null,
  ]);

  return (
    <VStack alignItems="start" width="full" mb={10} gap={2} px={1}>
      {documentStatuses.map(({ label, value, icon, options }) => (
        <HStack key={label} width="full">
          <HStack flex={3}>
            {icon}
            <Text>{label}</Text>
          </HStack>
          <Text flex={7} {...options}>
            {value}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
};

export default ShowDocumentStats;
