import { QueryResult } from "pg";

import { createQueries } from "./queries";
import { Image, ImageParams } from "common";

export const imageQueries = (function () {
  const queries = createQueries<Image>(["*"], "images");
  const { columns, db, getById, table } = queries;

  const create = async ({
    url,
    descriptionurl,
    comment,
    title,
    word_id,
  }: ImageParams): Promise<Image> => {
    const existingImage = await getByUrl(url);

    if (existingImage) {
      return existingImage;
    }

    const { rows }: QueryResult<Image> = await db.query(
      `
    INSERT INTO ${table}(url, descriptionurl, comment, word_id)
    VALUES ($1, $2, $3, $4)
    RETURNING ${columns};
      `,
      [url, descriptionurl, comment ?? title, word_id]
    );

    return rows[0];
  };

  const getByUrl = async (url: string): Promise<Image | undefined> => {
    const { rows }: QueryResult<Image> = await db.query(
      `
    SELECT ${columns}
    FROM ${table}
    WHERE url = $1;
      `,
      [url]
    );

    return rows[0];
  };

  return { create, getById: getById.bind(queries) };
})();
