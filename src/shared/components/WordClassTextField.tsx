import React, { ReactElement } from 'react';
import WordClass from '../constants/WordClass';
import { WordClassTextFieldProps } from '../interfaces';

const WordClassTextField = ({ record, source }: WordClassTextFieldProps): ReactElement => (
  <span>{WordClass[record[source]]?.label || `${record[source]} [UPDATE PART OF SPEECH]`}</span>
);

export default WordClassTextField;
