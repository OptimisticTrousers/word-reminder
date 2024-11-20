import fs from "fs";
import { resolve } from "path";

import { Csv } from "../utils/csv";

describe("csv", () => {
  const csv = new Csv();

  describe("readCsv", () => {
    it("returns the list of values when the words are in a column", async () => {
      const fileBuffer = fs.readFileSync(
        resolve(__dirname, "../csv/columnWords.csv")
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

    it("returns the list of values when the words are in a row", async () => {
      const fileBuffer = fs.readFileSync(
        resolve(__dirname, "../csv/rowWords.csv")
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
        resolve(__dirname, "../csv/empty.csv")
      );

      const { records, error, count } = await csv.read(fileBuffer);

      expect(records).toEqual([]);
      expect(error).toBeNull();
      expect(count).toBe(0);
    });

    it("ignores duplicate values", async () => {
      const fileBuffer = fs.readFileSync(
        resolve(__dirname, "../csv/duplicates.csv")
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
        resolve(__dirname, "../csv/incorrect.csv")
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
  });
});
