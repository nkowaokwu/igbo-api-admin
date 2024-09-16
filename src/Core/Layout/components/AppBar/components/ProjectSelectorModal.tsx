import React, { ReactElement, useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  HStack,
  chakra,
  Divider,
  VStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { PlusSquareIcon, StarIcon } from '@chakra-ui/icons';
import { FiSettings } from 'react-icons/fi';
import { getAllProjects } from 'src/shared/ProjectAPI';
import { ProjectData } from 'src/backend/controllers/utils/interfaces';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import UserRoles from 'src/backend/shared/constants/UserRoles';

const ProjectSelectorModal = ({
  isOpen,
  onClose,
  onCreateProject,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: () => void;
}): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<(ProjectData & { role: UserRoles })[]>([]);

  const setProjectInLocalStorage = (projectId: string) => {
    window.localStorage.setItem(LocalStorageKeys.PROJECT_ID, projectId);
  };

  const handleProjectSettingsSelect = (projectId: string) => {
    setProjectInLocalStorage(projectId);
    onClose();
    window.location.hash = '#/settings';
    window.location.reload();
  };

  const handleProjectSelect = (projectId: string) => {
    setProjectInLocalStorage(projectId);
    window.location.reload();
  };

  const handleCreateProject = () => {
    onCreateProject();
    onClose();
  };

  useEffect(() => {
    setIsLoading(true);
    if (!projects.length) {
      (async () => {
        try {
          const userProjects = await getAllProjects();
          setProjects(userProjects);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered onEsc={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <chakra.span>Choose a project</chakra.span>
            <Button
              variant="ghost"
              color="purple.500"
              leftIcon={<PlusSquareIcon />}
              backgroundColor="transparent"
              _hover={{ backgroundColor: 'transparent' }}
              _active={{ backgroundColor: 'transparent' }}
              _focus={{ backgroundColor: 'transparent' }}
              onClick={handleCreateProject}
            >
              New Project
            </Button>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems="start">
            <Divider />
            {isLoading
              ? 'Loading...'
              : projects.map((project) => {
                  const isCurrentProject =
                    project.id.toString() === window.localStorage.getItem(LocalStorageKeys.PROJECT_ID);

                  return (
                    <HStack width="full" justifyContent="space-between" key={project.id.toString()}>
                      <HStack gap={0}>
                        <StarIcon opacity={isCurrentProject ? 1 : 0} pointerEvents="none" />
                        <Button
                          key={project.id.toString()}
                          variant="ghost"
                          backgroundColor="transparent"
                          _hover={{ backgroundColor: 'transparent' }}
                          _active={{ backgroundColor: 'transparent' }}
                          _focus={{ backgroundColor: 'transparent' }}
                          color="blue.400"
                          textDecoration="underline"
                          onClick={() => handleProjectSelect(project.id.toString())}
                        >
                          {project.title}
                        </Button>
                      </HStack>
                      {project.role === UserRoles.ADMIN ? (
                        <Tooltip label="Project settings">
                          <IconButton
                            variant="ghost"
                            aria-label="Project settings button"
                            icon={<FiSettings />}
                            backgroundColor="transparent"
                            _hover={{ backgroundColor: 'transparent' }}
                            _active={{ backgroundColor: 'transparent' }}
                            _focus={{ backgroundColor: 'transparent' }}
                            onClick={() => handleProjectSettingsSelect(project.id.toString())}
                          />
                        </Tooltip>
                      ) : null}
                    </HStack>
                  );
                })}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProjectSelectorModal;
