import { Control, UseFormGetValues, UseFormSetValue } from 'react-hook-form';

interface ExamplesFormInterface {
  control: Control;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
}

export default ExamplesFormInterface;
