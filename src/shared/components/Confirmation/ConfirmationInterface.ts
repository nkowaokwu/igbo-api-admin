import React from 'react';
import { ButtonProps } from 'react-admin';
import Views from 'src/shared/constants/Views';

export interface UpdateButtonProps extends ButtonProps {
  push: (value: string) => any,
};

export interface ConfirmationButtonInterface extends UpdateButtonProps {
  collection: string,
  selectionValue: string,
  action: any,
  onClose: () => any,
  isOpen: boolean,
  view: Views
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
}

export interface ConfirmationInputInterface {
  onChange: (value) => void,
  value: string,
  onSubmit: () => void,
  header: string,
  placeholder: string,
  type: string,
  max?: number | string,
};
