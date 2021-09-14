import { CallableFunctionInputs, CallableFunctionResponse, CallableFunction } from '../shared/server-validation';
import { useFirebase } from './useFirebase';
import useFirebaseConfig from './useFirebaseConfig';

/**
 * Custom hook for using Firebase callable functions
 * @param name Name of the exported function in firebase
 */
export const useCallable = <CallableInputs extends CallableFunctionInputs,
  CallableOutputs extends CallableFunctionResponse>(name: string) => {
  const firebaseConfig = useFirebaseConfig();
  const firebase = useFirebase(firebaseConfig);
  const fn = firebase.functions().httpsCallable(name) as CallableFunction<CallableInputs, CallableOutputs>;
  return fn;
};
