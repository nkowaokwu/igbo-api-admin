import React, { ReactElement } from 'react';
import { Avatar, Box, Heading, Input, Link, Select, Text, Tooltip, chakra, useToast } from '@chakra-ui/react';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import { usePermissions } from 'react-admin';
import { FormattedUser } from 'src/backend/controllers/utils/interfaces';
import copyToClipboard from 'src/shared/utils/copyToClipboard';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import Dialect from 'src/backend/shared/constants/Dialect';
import Gender from 'src/backend/shared/constants/Gender';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';

const UserCard = ({
  isEditing = false,
  displayName,
  photoURL,
  email,
  age,
  gender,
  dialects,
}: Partial<FormattedUser> & {
  isEditing?: boolean;
  age: number;
  gender: GenderEnum;
  dialects: DialectEnum[];
}): ReactElement => {
  const permissions = usePermissions();
  const toast = useToast();
  const isAdmin = hasAdminPermissions(permissions.permissions, true);

  const handleCopyId = () => {
    copyToClipboard(
      {
        copyText: email,
        successMessage: `${displayName}'s email has been copied to your clipboard`,
      },
      toast,
    );
  };

  return (
    <Box className="flex flex-col md:flex-row items-center text-center md:text-left space-y-4 md:space-x-4 mb-4 p-6">
      <Avatar name={displayName} src={photoURL} size="xl" />
      <Box>
        {isEditing ? (
          <Box className="flex flex-col space-y-3">
            <Box>
              <Text fontFamily="heading">Full name</Text>
              <Input
                id="user-profile-display-name-input"
                data-test="user-profile-display-name-input"
                fontFamily="heading"
                defaultValue={displayName}
              />
            </Box>
            <Box>
              <Text fontFamily="heading">Age</Text>
              <Input id="user-profile-age-input" type="number" fontFamily="heading" defaultValue={age} />
            </Box>
            <Box className="flex flex-row space-x-3">
              <Box>
                <Text fontFamily="heading">Native dialect</Text>
                <Select id="user-dialect-input" defaultValue={dialects[0]}>
                  {Object.values(Dialect).map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text fontFamily="heading">Gender</Text>
                <Select id="user-gender-input" defaultValue={gender}>
                  {Object.values(Gender).map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Box>
            </Box>
          </Box>
        ) : (
          <>
            <Heading className={!displayName ? 'text-gray-500 italic' : ''}>{displayName || 'No display name'}</Heading>
            <Box className="flex flex-row items-center space-x-3">
              <Text fontFamily="heading">
                <chakra.span mr={1} fontWeight="bold">
                  Age:
                </chakra.span>
                {age}
              </Text>
              <Text fontFamily="heading">
                <chakra.span mr={1} fontWeight="bold">
                  Gender:
                </chakra.span>
                {Gender[gender].label}
              </Text>
            </Box>
            <Text fontFamily="heading">
              <chakra.span mr={1} fontWeight="bold">
                Dialects:
              </chakra.span>
              {dialects.map((dialect) => Dialect[dialect].label).join(', ')}
            </Text>
            <Box className="flex flex-row space-x-2">
              <Link color="green" href={`mailto:${email}`}>
                {email}
              </Link>
              {isAdmin ? (
                <Tooltip label={`Copy ${displayName}'s email`}>
                  <FileCopyIcon className="cursor-pointer" style={{ height: 20 }} onClick={handleCopyId} />
                </Tooltip>
              ) : null}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default UserCard;
