import { Control } from 'react-hook-form';
import { Example } from 'src/backend/controllers/utils/interfaces';

interface ExamplesFormInterface {
  example: Example;
  index: number;
  remove: (index?: number | number[]) => void;
  control: Control;
  setValue: (key: string, value: any) => void;
}

export default ExamplesFormInterface;
