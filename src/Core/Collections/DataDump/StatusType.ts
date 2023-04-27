import { ExampleClientData } from 'src/backend/controllers/utils/interfaces';

type StatusType = {
  success: boolean,
  message?: string,
  meta: {
    id: string,
    sentenceData: ExampleClientData,
  }
};

export default StatusType;
