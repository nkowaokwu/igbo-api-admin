import { Control, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { Example } from 'src/backend/controllers/utils/interfaces';

interface ExamplesFormInterface {
  example: Example;
  index: number;
  remove: (index?: number | number[]) => void;
  control: Control;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
}

export default ExamplesFormInterface;
