import { Request, Response, NextFunction } from 'express';
import { connectDatabase, disconnectDatabase, isConnected } from '../utils/database';

export default (MONGO_URI: string) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Create a MongoDB connection if:
  // 1. In a testing environment that hasn't made a connection
  // 2. In production that uses serverless functions
  if (process.env.NODE_ENV === 'test' && !isConnected) {
    await connectDatabase(MONGO_URI);
  } else if (process.env.NODE_ENV !== 'test') {
    await connectDatabase(MONGO_URI);
  }

  // Disconnect from database if not in a testing environment
  if (process.env.NODE_ENV !== 'test') {
    const afterResponse = async () => {
      await disconnectDatabase(MONGO_URI);
    };
    res.on('finish', afterResponse);
    res.on('close', afterResponse);
  }
  next();
};
