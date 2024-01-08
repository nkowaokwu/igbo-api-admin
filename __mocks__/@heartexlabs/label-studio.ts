/* eslint-disable */

class LabelStudio {
  private information = '';
  public on = (eventName: string, callback: (LS: any, annotation?: any) => void) => {
    // console.log('Event hooked:', eventName);
    if (eventName === 'labelStudioLoad') {
      return callback({
        annotationStore: {
          addAnnotation: () => ({ id: '' }),
          selectAnnotation: () => null,
        },
      });
    }
    return callback(
      {},
      {
        serializeAnnotation: () => null,
      },
    );
  };
  constructor(information: any) {
    this.information = information;
  }
}

export default LabelStudio;
