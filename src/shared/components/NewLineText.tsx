import React from 'react';

const NewLineText = ({ text }) => (
  text.split('\n').map((str) => (str === '' ? <br /> : <p>{str}</p>))
);

export default NewLineText;
