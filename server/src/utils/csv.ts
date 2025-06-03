import { parse } from "csv-parse";
import { Readable } from "stream";
import { finished } from "stream/promises";

export const csv = (function () {
  const read = async (buffer: Buffer) => {
    const records: string[][] = [];
    const parser = Readable.from(buffer).pipe(
      parse({
        delimiter: ",",
        relax_column_count: true,
        skip_empty_lines: true,
        trim: true,
      })
    );

    let count = 0;

    parser.on("readable", () => {
      let record: string[];
      while ((record = parser.read() as string[]) !== null) {
        const trimmedRecord = removeDuplicates(record);
        count += trimmedRecord.length;
        records.push(trimmedRecord);
      }
    });

    try {
      await finished(parser);
    } catch (error) {
      return { records, error, count };
    }

    return { records, error: null, count };
  };

  const removeDuplicates = (record: string[]) => {
    const set = new Set<string>();
    for (let i = 0; i < record.length; i++) {
      const word = record[i];
      if (word !== "") {
        set.add(word);
      }
    }
    return Array.from(set);
  };

  return { read, removeDuplicates };
})();
