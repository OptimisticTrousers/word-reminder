import { imageQueries } from "../db/image_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";
import { wordQueries } from "../db/word_queries";

describe("imageQueries", () => {
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

  describe("create", () => {
    it("creates images", async () => {
      const image = {
        title: "File:Blue pencil.svg",
        comment: "Colors aligned with Wikimedia color palette ([[phab:M82]])",
        url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Blue_pencil.svg",
        descriptionurl:
          "https://commons.wikimedia.org/wiki/File:Blue_pencil.svg",
      };
      const newWord = await wordQueries.create({ json: wordJson });

      const newImage = await imageQueries.create({
        ...image,
        word_id: newWord.id,
      });

      expect(newImage).toEqual({
        id: 1,
        url: image.url,
        descriptionurl: image.descriptionurl,
        comment: image.comment,
        word_id: newWord.id,
      });
    });

    it("creates images when the 'comment' property is not defined on an image", async () => {
      const image = {
        title: "File:Blue pencil.svg",
        url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Blue_pencil.svg",
        descriptionurl:
          "https://commons.wikimedia.org/wiki/File:Blue_pencil.svg",
      };
      const newWord = await wordQueries.create({ json: wordJson });

      const newImage = await imageQueries.create({
        ...image,
        word_id: newWord.id,
      });

      expect(newImage).toEqual({
        id: 1,
        url: image.url,
        descriptionurl: image.descriptionurl,
        comment: image.title,
        word_id: newWord.id,
      });
    });

    it("returns images if the images were already created", async () => {
      const image = {
        title: "File:Blue pencil.svg",
        comment: "Colors aligned with Wikimedia color palette ([[phab:M82]])",
        url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Blue_pencil.svg",
        descriptionurl:
          "https://commons.wikimedia.org/wiki/File:Blue_pencil.svg",
      };
      const newWord = await wordQueries.create({ json: wordJson });

      const newImage = await imageQueries.create({
        ...image,
        word_id: newWord.id,
      });

      expect(newImage).toEqual({
        id: 1,
        url: image.url,
        descriptionurl: image.descriptionurl,
        comment: image.comment,
        word_id: newWord.id,
      });
    });
  });
});
