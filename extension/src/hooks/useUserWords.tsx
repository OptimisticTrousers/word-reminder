import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useHttp from "./useHttp";

interface Props {
  learned: boolean;
  sort: string;
  search: string;
}

const useUserWords = ({ learned, search, sort }: Props) => {
  const { get } = useHttp();
  const {
    state: { user },
  } = useAuth();

  const userId = user!._id;

  const query = new URLSearchParams();
  if (typeof learned === "boolean") {
    query.append("learned", learned.toString());
  }
  if (search) {
    query.append("search", search);
  }
  if (sort) {
    query.append("sort", sort);
  }

  const {
    data: userWords,
    status: userWordsStatus,
    error: userWordsError,
  } = useQuery({
    queryKey: [userId, "words", { learned, search, sort }],
    queryFn: () => {
      return get(
        `${import.meta.env.VITE_API_DOMAIN}/users/${userId}/words${
          query.size ? "?" : ""
        }${query}`
      );
    },
  });

  return { userWords, userWordsStatus, userWordsError };
};

export default useUserWords;
