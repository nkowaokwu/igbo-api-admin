class MicRecorder {
  constructor(options) {}

  async start() {
    return null;
  }

  stop() {
    return {
      getMp3: async () => {
        return [['foo'], { type: 'audio' }]
      }
    }
  }
}

export default MicRecorder;
