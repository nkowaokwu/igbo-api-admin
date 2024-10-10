import React, { ReactElement } from 'react';
import { Box, Heading, VStack, Text, HStack, Button, useDisclosure } from '@chakra-ui/react';
import DataEntryFlow from 'src/Core/Dashboard/components/DataEntryFlow';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import generateGreetings from 'src/Core/Dashboard/components/utils/generateGreetings';
import { DataEntryFlowGroup } from 'src/Core/Dashboard/components/utils/DataEntryFlowOptionInterface';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { getDashboardOptions } from 'src/Core/Dashboard/utils/getDashboardOptions';
import { UserProjectPermissionContext } from 'src/App/contexts/UserProjectPermissionContext';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import { UserProjectPermission } from 'src/backend/controllers/utils/interfaces';
import { FiDownloadCloud } from 'react-icons/fi';
import ExportModal from 'src/Core/Dashboard/components/ExportModal';
import { hasPlatformAdminPermissions } from 'src/shared/utils/permissions';

export const DataEntryFlowGroupLabels = {
  [DataEntryFlowGroup.GET_STARTED]: {
    title: 'Get started',
    subtitle: 'Visit these section to get your project set up',
  },
  [DataEntryFlowGroup.CREATE_DATA]: {
    title: 'Create data',
    subtitle: 'Use these options to add ad-hoc data after your initial data import',
  },
  [DataEntryFlowGroup.EDIT_DATA]: {
    title: 'Edit data',
    subtitle: 'Use these sections to update and make edits to your existing data',
  },
};

const getShouldShowSelfIdentify = (userProjectPermission: UserProjectPermission) =>
  !userProjectPermission.languages ||
  !userProjectPermission.languages.length ||
  userProjectPermission.gender === null ||
  userProjectPermission.gender === GenderEnum.UNSPECIFIED;

const ProgressManager = ({ permissions }: { permissions: { permissions?: { role: UserRoles } } }): ReactElement => {
  const userProjectPermission = React.useContext(UserProjectPermissionContext);
  const isIgboAPIProject = useIsIgboAPIProject();
  const showSelfIdentify = getShouldShowSelfIdentify(userProjectPermission);
  const options = getDashboardOptions({ permissions, isIgboAPIProject, showSelfIdentify });
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <ExportModal isOpen={isOpen} onClose={onClose} />
      <VStack py={6} px={{ base: 6, md: 12 }} gap={4} alignItems="start">
        <HStack width="full" justifyContent="space-between">
          <VStack alignItems="left">
            <Heading as="h1">{generateGreetings()}</Heading>
            <Text fontWeight="medium" color="gray.500" fontFamily="Silka">
              Here&apos;s an overview of your available tasks
            </Text>
          </VStack>
          {hasPlatformAdminPermissions(
            permissions?.permissions,
            <Button variant="primary" leftIcon={<FiDownloadCloud />} onClick={onOpen}>
              Export
            </Button>,
          )}
        </HStack>
        {options.length ? (
          <Box className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" width="full">
            {options.map((option) => (
              <DataEntryFlow key={option.title} {...option} />
            ))}
          </Box>
        ) : (
          <VStack alignItems="start" width="full">
            <Heading color="gray.400">No tasks available</Heading>
          </VStack>
        )}
      </VStack>
    </>
  );
};

export default ProgressManager;
