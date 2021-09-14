import React, { ReactElement, useState } from 'react';
import { connect } from 'react-redux';
import { Confirm, Button, ButtonProps } from 'react-admin';
import { push } from 'react-router-redux';

const CustomUpdateButton = ({ resource, ...rest }: ButtonProps): ReactElement => (
  <Button redirect={`/${resource}`} label="Update Document" {...rest} />
);

const UpdateButton = ({
  handleSubmit,
  onSave,
  invalid,
  pristine,
  ...rest
}: ButtonProps): ReactElement => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  return (
    <>
      <Confirm
        isOpen={isConfirmOpen}
        title="Update Document"
        content="Are you sure you want to update this document?"
        confirm="Yes"
        confirmColor="primary"
        cancel="Cancel"
        onConfirm={() => {
          handleSubmit();
          setIsConfirmOpen(false);
        }}
        onClose={() => setIsConfirmOpen(false)}
      />
      <CustomUpdateButton
        disabled={pristine}
        onClick={() => setIsConfirmOpen(true)}
        resource={rest.resource}
        {...rest}
      />
    </>
  );
};

export default connect(null, {
  push,
})(UpdateButton);
