import { imageQueries } from "../db/image_queries";
import { wordQueries } from "../db/word_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

const wordJson = [
  {
    word: "hello",
    phonetics: [
      {
        audio:
          "https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=75797336",
        license: {
          name: "BY-SA 4.0",
          url: "https://creativecommons.org/licenses/by-sa/4.0",
        },
      },
      {
        text: "/həˈləʊ/",
        audio:
          "https://api.dictionaryapi.dev/media/pronunciations/en/hello-uk.mp3",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=9021983",
        license: {
          name: "BY 3.0 US",
          url: "https://creativecommons.org/licenses/by/3.0/us",
        },
      },
      {
        text: "/həˈloʊ/",
        audio: "",
      },
    ],
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: '"Hello!" or an equivalent greeting.',
            synonyms: [],
            antonyms: [],
          },
        ],
        synonyms: ["greeting"],
        antonyms: [],
      },
    ],
  },
];

describe("imageQueries", () => {
  describe("create", () => {
    it("creates images", async () => {
      const newWord = await wordQueries.create({ json: wordJson });
      const imageParams = {
        title: "File:Blue pencil.svg",
        comment: "Colors aligned with Wikimedia color palette ([[phab:M82]])",
        url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Blue_pencil.svg",
        descriptionurl:
          "https://commons.wikimedia.org/wiki/File:Blue_pencil.svg",
        word_id: newWord.id,
      };

      const newImage = await imageQueries.create(imageParams);

      expect(newImage).toEqual({
        id: 1,
        url: imageParams.url,
        descriptionurl: imageParams.descriptionurl,
        comment: imageParams.comment,
        word_id: newWord.id,
      });
    });

    it("returns images if the images were already created", async () => {
      const newWord = await wordQueries.create({ json: wordJson });
      const imageParams = {
        title: "File:Blue pencil.svg",
        comment: "Colors aligned with Wikimedia color palette ([[phab:M82]])",
        url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Blue_pencil.svg",
        descriptionurl:
          "https://commons.wikimedia.org/wiki/File:Blue_pencil.svg",
        word_id: newWord.id,
      };

      await imageQueries.create(imageParams);

      const image = await imageQueries.create(imageParams);

      expect(image).toEqual({
        id: 1,
        url: imageParams.url,
        descriptionurl: imageParams.descriptionurl,
        comment: imageParams.comment,
        word_id: newWord.id,
      });
    });
  });

  describe("getByWordId", () => {
    it("returns all images associated with a word", async () => {
      const newWord = await wordQueries.create({ json: wordJson });
      const imageParams1 = {
        title: "File:Blue pencil.svg",
        comment: "Colors aligned with Wikimedia color palette ([[phab:M82]])",
        url: "/url1",
        descriptionurl: "/descriptionurl1",
        word_id: newWord.id,
      };
      const imageParams2 = {
        title: "File:Blue pencil.svg",
        comment: "Colors aligned with Wikimedia color palette ([[phab:M82]])",
        url: "/url2",
        descriptionurl: "/descriptionurl2",
        word_id: newWord.id,
      };
      const imageParams3 = {
        title: "File:Blue pencil.svg",
        comment: "Colors aligned with Wikimedia color palette ([[phab:M82]])",
        url: "/url3",
        descriptionurl: "/descriptionurl3",
        word_id: newWord.id,
      };

      await imageQueries.create(imageParams1);
      await imageQueries.create(imageParams2);
      await imageQueries.create(imageParams3);
      const newImages = await imageQueries.getByWordId(newWord.id);

      expect(newImages).toEqual([
        {
          id: 1,
          url: imageParams1.url,
          descriptionurl: imageParams1.descriptionurl,
          comment: imageParams1.comment,
          word_id: imageParams1.word_id,
        },
        {
          id: 2,
          url: imageParams2.url,
          descriptionurl: imageParams2.descriptionurl,
          comment: imageParams2.comment,
          word_id: imageParams2.word_id,
        },
        {
          id: 3,
          url: imageParams3.url,
          descriptionurl: imageParams3.descriptionurl,
          comment: imageParams3.comment,
          word_id: imageParams3.word_id,
        },
      ]);
    });
  });
});
