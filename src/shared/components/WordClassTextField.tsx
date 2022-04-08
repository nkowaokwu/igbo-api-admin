import React, { ReactElement } from 'react';
import { get } from 'lodash';
import WordClass from '../constants/WordClass';
import { WordClassTextFieldProps } from '../interfaces';

const WordClassTextField = ({ record, source }: WordClassTextFieldProps): ReactElement => (
  <span>{get(WordClass[get(record, source)], 'label') || `${get(record, source)} [UPDATE PART OF SPEECH]`}</span>
);

export default WordClassTextField;
