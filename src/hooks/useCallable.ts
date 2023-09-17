import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { CallableFunctionResponse, CallableFunction } from '../shared/server-validation';
import 'src/services/firebase';

/**
 * Custom hook for using Firebase callable functions
 * @param name Name of the exported function in firebase
 */
export const useCallable = <CallableInputs, CallableOutputs extends CallableFunctionResponse>(
  name: string,
): CallableFunction<CallableInputs, CallableOutputs> => {
  const functions = getFunctions(getApp());
  const callableFunction = httpsCallable(functions, name) as CallableFunction<CallableInputs, CallableOutputs>;
  return callableFunction;
};
