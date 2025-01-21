import fs from "fs";
import path from "path";

import { csv } from "../utils/csv";

describe("csv", () => {
  describe("read", () => {
    it("returns the list of values when the words are in a column", async () => {
      const fileBuffer = fs.readFileSync(
        path.resolve(__dirname, "csv", "column_words.csv")
      );

      const { records, error, count } = await csv.read(fileBuffer);

      expect(records).toEqual([["dispensation"], ["patronage"]]);
      expect(error).toBeNull();
      expect(count).toBe(2);
    });

    it("returns the list of values when the words are in a row", async () => {
      const fileBuffer = fs.readFileSync(
        path.resolve(__dirname, "csv", "row_words.csv")
      );

      const { records, error, count } = await csv.read(fileBuffer);

      expect(records).toEqual([
        ["dispensation", "serreptitously", "gutatory", "patronage"],
      ]);
      expect(error).toBeNull();
      expect(count).toBe(4);
    });

    it("returns an empty list when the file is empty", async () => {
      const fileBuffer = fs.readFileSync(
        path.resolve(__dirname, "csv", "empty.csv")
      );

      const { records, error, count } = await csv.read(fileBuffer);

      expect(records).toEqual([]);
      expect(error).toBeNull();
      expect(count).toBe(0);
    });

    it("ignores duplicate values", async () => {
      const fileBuffer = fs.readFileSync(
        path.resolve(__dirname, "csv", "duplicates.csv")
      );

      const { records, error, count } = await csv.read(fileBuffer);

      expect(records).toEqual([
        ["insert", "duplicate", "words", "into", "database"],
      ]);
      expect(error).toBeNull();
      expect(count).toBe(5);
    });

    it("eliminates empty strings at the end of each row if they end in a comma", async () => {
      const fileBuffer = fs.readFileSync(
        path.resolve(__dirname, "csv", "incorrect.csv")
      );

      const { records, error, count } = await csv.read(fileBuffer);

      expect(records).toEqual([
        ["dispensation"],
        ["serreptitously"],
        ["gutatory"],
        ["patronage"],
      ]);
      expect(error).toBeNull();
      expect(count).toBe(4);
    });

    it("returns the records, error, and count when the 'error' event is triggered", async () => {
      // Simulate malformed CSV data with non-closed double quote
      const malformedCsvBuffer = Buffer.from(
        '"name","age"\n"John",25\n"InvalidRecord'
      );

      const { records, error, count } = await csv.read(malformedCsvBuffer);

      expect((error as Error & { message: string }).message).toEqual(
        "Quote Not Closed: the parsing is finished with an opening quote at line 3"
      );
      expect(records).toEqual([]);
      expect(count).toBe(0);
    });
  });
});
