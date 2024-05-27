const useWords = () => {
  const { get, post } = useHttp();

  const {
    data: userWords,
    isSuccess,
    error: userWordsError,
  } = useQuery({
    queryKey: ["words"],
    queryFn: () => {
      return get(
        `${
          import.meta.env.VITE_API_DOMAIN
        }/users/665164760636f4834e053388/words`
      );
    },
  });
};
