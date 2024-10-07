import React, { ReactElement } from 'react';
import { truncate } from 'lodash';
import { Box, Button, HStack, Tooltip, useDisclosure } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { usePermissions } from 'react-admin';
import { LuVenetianMask } from 'react-icons/lu';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import ProjectSelectorModal from 'src/Core/Layout/components/AppBar/components/ProjectSelectorModal';
import CreateProjectDrawer from 'src/Core/Layout/components/AppBar/components/CreateProjectDrawer';
import { hasPlatformAdminPermissions } from 'src/shared/utils/permissions';

const ProjectSelector = (): ReactElement => {
  const permissions = usePermissions();
  const project = React.useContext(ProjectContext);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { isOpen: isCreateProjectOpen, onClose: onCreateProjectClose, onOpen: onCreateProjectOpen } = useDisclosure();

  return (
    <HStack gap={3} width="fit-content">
      {/* If the user is not apart of a project, the create project drawer will automatically open */}
      <CreateProjectDrawer
        isOpen={isCreateProjectOpen || !project?.id}
        onClose={onCreateProjectClose}
        showCloseButton={Boolean(project?.id)}
      />
      <ProjectSelectorModal isOpen={isOpen} onClose={onClose} onCreateProject={onCreateProjectOpen} />
      {hasPlatformAdminPermissions(
        permissions?.permissions,
        <Tooltip
          // eslint-disable-next-line max-len
          label="You are currently viewing the platform as a Platform Admin. You have the same ability as a regaluar admin, which includes editing data. Please proceed with caution."
          placement="bottom"
        >
          <Box>
            <LuVenetianMask color="var(--chakra-colors-orange-500)" size="24px" />
          </Box>
        </Tooltip>,
      )}
      <Button
        rightIcon={<ChevronDownIcon />}
        backgroundColor="transparent"
        borderWidth="1px"
        borderColor="blue.400"
        color="gray.700"
        _hover={{ backgroundColor: 'transparent' }}
        _active={{ backgroundColor: 'transparent' }}
        _focus={{ backgroundColor: 'transparent' }}
        onClick={isOpen ? onClose : onOpen}
      >
        {truncate(project?.title, { length: 16 }) || '...'}
      </Button>
    </HStack>
  );
};

export default ProjectSelector;
