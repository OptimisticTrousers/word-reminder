import { useMutation } from "@tanstack/react-query";
import useHttp from "./useHttp";

const useCreateUserWord = () => {
  

  return {
    createdUserWord,
    createdUserWordStatus,
    createdUserWordError,
    createdUserWordMutate,
  };
};

export default useCreateUserWord;
