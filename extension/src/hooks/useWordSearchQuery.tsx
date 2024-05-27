import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import * as z from "zod";
import useHttp from "./useHttp";

const schema = z.object({
  query: z.string({
    invalid_type_error: "Query must be a string",
  }),
  learned: z.boolean({
    invalid_type_error: "Query must be a boolean",
  }),
  sort: z.enum([
    "alphabeticallyAscending",
    "alphabeticallyDescending",
    "ascending",
    "descending",
  ]),
});

const useWordSearchQuery = () => {
  const { get } = useHttp();
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      query: "",
      learned: false,
      sort: "",
    },
    resolver: zodResolver(schema),
  });

  const { query, learned, sort } = watch();
  const { data, status, error } = useQuery({
    queryKey: ["words"],
    queryFn: () => {
      return get(
        `${
          import.meta.env.VITE_API_DOMAIN
        }/users/665164760636f4834e053388/words?query=${query}&learned=${learned}&sort=${sort}`
      );
    },
  });

  return { register, handleSubmit, errors, data, status, error };
};

export default useWordSearchQuery;
