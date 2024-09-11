import React from 'react';
import { Avatar, Divider, HStack, IconButton, Text, Tooltip, VStack } from '@chakra-ui/react';
import { FiLogOut } from 'react-icons/fi';
import { useLogout } from 'react-admin';
import { getAuth } from 'firebase/auth';
import { UserProjectPermissionContext } from 'src/App/contexts/UserProjectPermissionContext';
import UserRoleLabels from 'src/backend/shared/constants/UserRoleLabels';

const auth = getAuth();
const UserSection = (): React.ReactElement => {
  const { currentUser } = auth;
  const userProjectPermission = React.useContext(UserProjectPermissionContext);
  const logout = useLogout();

  return (
    <VStack alignItems="start" px={4} width="full">
      <Divider />
      <HStack justifyContent="space-between" py={2} gap={2} width="full">
        <HStack gap={2} flex={8}>
          <Avatar src={currentUser?.photoURL} name={currentUser?.displayName} />
          <VStack alignItems="start" spacing={0}>
            <Text fontWeight="bold" fontSize="sm">
              {currentUser?.displayName}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={0}>
              {UserRoleLabels[userProjectPermission?.role]}
            </Text>
          </VStack>
        </HStack>
        <Tooltip label="Logout">
          <IconButton
            flex={2}
            aria-label="Logout button"
            icon={<FiLogOut size="22px" />}
            boxSize={3}
            backgroundColor="transparent"
            onClick={logout}
            _hover={{ backgroundColor: 'transparent' }}
            _active={{ backgroundColor: 'transparent' }}
            _focus={{ backgroundColor: 'transparent' }}
          />
        </Tooltip>
      </HStack>
    </VStack>
  );
};

export default UserSection;
