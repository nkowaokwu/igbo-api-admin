import React, { ReactElement } from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import ProjectSelectorModal from 'src/Core/Layout/components/AppBar/components/ProjectSelectorModal';
import CreateProjectDrawer from 'src/Core/Layout/components/AppBar/components/CreateProjectDrawer';

const ProjectSelector = (): ReactElement => {
  const project = React.useContext(ProjectContext);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { isOpen: isCreateProjectOpen, onClose: onCreateProjectClose, onOpen: onCreateProjectOpen } = useDisclosure();

  return (
    <>
      <CreateProjectDrawer isOpen={isCreateProjectOpen} onClose={onCreateProjectClose} />
      <ProjectSelectorModal isOpen={isOpen} onClose={onClose} onCreateProject={onCreateProjectOpen} />
      <Button
        rightIcon={<ChevronDownIcon />}
        backgroundColor="transparent"
        borderWidth="1px"
        borderColor="blue.400"
        _hover={{ backgroundColor: 'transparent' }}
        _active={{ backgroundColor: 'transparent' }}
        _focus={{ backgroundColor: 'transparent' }}
        onClick={isOpen ? onClose : onOpen}
      >
        {project?.title || '...'}
      </Button>
    </>
  );
};

export default ProjectSelector;
