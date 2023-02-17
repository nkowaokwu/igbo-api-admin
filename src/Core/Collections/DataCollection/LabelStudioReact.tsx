import React, { useEffect, useRef, ReactElement } from 'react';
import LabelStudio from '@heartexlabs/label-studio';

const LabelStudioReact = (): ReactElement => {
  const labelStudioContainerRef = useRef();

  useEffect(() => {
    const labelStudio = new LabelStudio(labelStudioContainerRef.current, {
      config: `
        <View>
  <Labels name="labels" toName="audio">
    <Label value="Speech" />
    <Label value="Noise" />
  </Labels>
  <AudioPlus name="audio" value="$audio"/>
</View>
      `,
      interfaces: [
        'panel',
        'update',
        'skip',
        'submit',
        'controls',
        'side-column',
        'annotations:history',
        'annotations:tabs',
        'annotations:current',
        'annotations:view-all',
        'annotations:menu',
        'annotations:add-new',
        'annotations:delete',
        'predictions:tabs',
        'predictions:menu',
        'edit-history',
      ],
      user: {
        pk: 1,
        firstName: 'James',
        lastName: 'Dean',
      },
      task: {
        annotations: [],
        predictions: [],
        id: 1,
        data: {
          audio: 'https://igbo-api.s3.us-east-2.amazonaws.com/audio-pronunciations/5f90c35e49f7e863e92b72f2.webm',
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
    });
  }, []);

  // useEffect(() => {
  //   if (labelStudioContainerRef.current) {
  //     labelStudioRef.current = new LabelStudio(labelStudioContainerRef.current, {
  //       ...props,
  //       onSubmitAnnotation: (LS) => {
  //         console.log('submit', LS)
  //       },
  //       onUpdateAnnotation: (LS) => {
  //         console.log('update', LS)
  //       },
  //       onSelectAnnotation: (LS) => {
  //         console.log('select', LS)
  //       },
  //       onEntityCreate: (LS) => {
  //         console.log('create ', LS)
  //       },
  //     });
  //   }
  // }, []);

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
