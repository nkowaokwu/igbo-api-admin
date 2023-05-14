import { Control } from 'react-hook-form';

interface ExamplesFormInterface {
  control: Control,
  setValue: (key: string, value: any) => void,
};

export default ExamplesFormInterface;
