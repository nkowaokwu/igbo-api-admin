import React, { useEffect, useRef, ReactElement } from 'react';
import { getAuth } from 'firebase/auth';
import LabelStudio from '@heartexlabs/label-studio';

const config = `
<View>
<Labels name="labels" toName="audio">
<Label value="Speech" />
</Labels>
<AudioPlus name="audio" value="$audio"/>
<TextArea name="transcription" toName="audio"
    rows="2" editable="true"
    perRegion="true" />
</View>
`;

const interfaces = [
  'panel',
  'submit',
  'update',
  'controls',
  'topbar',
  'infobar',
  'instructions',
  'side-column',
  'edit-history',
];

const cleanAnnotations = (annotation) => {
  const annotations = annotation.serializeAnnotation();
  return annotations;
};

const LabelStudioReact = ({
  data,
  annotations,
  onSubmit,
  onUpdate,
} : {
  data: string,
  annotations: any[],
  onSubmit: (value: any) => void,
  onUpdate: (value: any) => void,
}): ReactElement => {
  const labelStudioContainerRef = useRef();
  const auth = getAuth();
  const { currentUser } = auth;

  useEffect(() => {
    const labelStudio = new LabelStudio(labelStudioContainerRef.current, {
      config,
      interfaces,
      user: {
        pk: 1,
        firstName: currentUser.displayName.split(' ')[0],
        lastName: currentUser.displayName.split(' ')[1],
      },
      task: {
        annotations: annotations || [],
        predictions: [],
        id: 1,
        data: {
          audio: data,
        },
      },
    });

    labelStudio.on('labelStudioLoad', (LS) => {
      // Perform an action when Label Studio is loaded
      const c = LS.annotationStore.addAnnotation({
        userGenerate: true,
      });
      LS.annotationStore.selectAnnotation(c.id);
    });
    labelStudio.on('submitAnnotation', (LS, annotation) => {
      // Retrieve an annotation in JSON format
      console.log(annotation.serializeAnnotation());
      const annotations = cleanAnnotations(annotation);
      onSubmit(annotations);
    });
    labelStudio.on('updateAnnotation', (LS, annotation) => {
      console.log(annotation.serializeAnnotation());
      const annotations = cleanAnnotations(annotation);
      onUpdate(annotations);
    });
  }, []);

  return (
    <>
      <div
        id="label-studio"
        ref={labelStudioContainerRef}
      />
    </>
  );
};

export default LabelStudioReact;
