import { ButtonProps } from 'react-admin';
import Views from '../../constants/Views';

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
