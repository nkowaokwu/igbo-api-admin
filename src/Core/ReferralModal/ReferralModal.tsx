import React from 'react';
import {
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  Button,
  chakra,
  Input,
  FormErrorMessage,
  FormHelperText,
  Text,
} from '@chakra-ui/react';

export const ReferralModal = (): React.ReactElement => {
  const [{ error, value }, setReferralCode] = React.useState({
    value: '',
    error: '',
  });

  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setReferralCode({
      error: '',
      value: target.value,
    });
  };

  const helperText = error ? (
    <FormErrorMessage fontSize="xs">{error}</FormErrorMessage>
  ) : (
    <FormHelperText fontSize="xs">It should be a 10 digit code.</FormHelperText>
  );

  return (
    <chakra.form>
      <ModalContent px={1}>
        <ModalHeader px={3} py={3}>
          Submit a referral code
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px={3} pt={0}>
          <Text fontSize="sm">Don&apos;t have any? ask a friend for their own</Text>
          <FormControl isRequired>
            <Input height={14} mt={4} mb={1} placeholder="whats the code?" value={value} onChange={handleChange} />
            {helperText}
          </FormControl>
        </ModalBody>
        <ModalFooter px={3} display="flex" flexDirection="column" alignItems="flex-start">
          <Button
            disabled={!value}
            mb={4}
            borderRadius={0}
            backgroundColor="green.300"
            color="white"
            width="100%"
            onClick={() => {
              console.log('onCLick');
            }}
          >
            Submit
          </Button>
          <Text fontSize="sm">To know your own referral code? **Go here**</Text>
        </ModalFooter>
      </ModalContent>
    </chakra.form>
  );
};
