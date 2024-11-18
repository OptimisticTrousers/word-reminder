import fs from "fs";
import { resolve } from "path";

import { Csv } from "../utils/csv";

describe("csv", () => {
  const csv = new Csv();

  describe("readCsv", () => {
    it("returns the list of values when the words are in a column", async () => {
      const filePath = resolve(__dirname, "../csv/columnWords.csv");

      const { records, error } = await csv.read(filePath);

      expect(records).toEqual([
        ["dispensation"],
        ["serreptitously"],
        ["gutatory"],
        ["patronage"],
      ]);
      expect(error).toBeNull();
    });

    it("returns the list of values when the words are in a row", async () => {
      const filePath = resolve(__dirname, "../csv/rowWords.csv");

      const { records, error } = await csv.read(filePath);

      expect(records).toEqual([
        ["dispensation", "serreptitously", "gutatory", "patronage"],
      ]);
      expect(error).toBeNull();
    });

    it("returns an empty list when the file is empty", async () => {
      const filePath = resolve(__dirname, "../csv/empty.csv");

      const { records, error } = await csv.read(filePath);

      expect(records).toEqual([]);
      expect(error).toBeNull();
    });

    it("ignores duplicate values", async () => {
      const filePath = resolve(__dirname, "../csv/duplicates.csv");

      const { records, error } = await csv.read(filePath);

      expect(records).toEqual([
        ["insert", "duplicate", "duplicate", "words", "into", "database"],
      ]);
      expect(error).toBeNull();
    });
  });
});
