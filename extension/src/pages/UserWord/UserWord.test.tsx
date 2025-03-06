import { render, screen } from "@testing-library/react";
import { userWordService } from "../../services/user_word_service";
import { UserWord } from "./UserWord";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Props } from "../../components/ui/ImageCarousel/ImageCarousel";

vi.mock("../../components/ui/Loading/Loading");

vi.mock("../Error500/Error500");

vi.mock("../../components/ui/ImageCarousel", () => {
  return {
    ImageCarousel: function (props: Props) {
      return <div data-testid="image-carousel">{String(props)}</div>;
    },
  };
});

describe("UserWord component", () => {
  const testUser = {
    id: "1",
  };
  const userWordId = "1";
  const status = 200;
  const created_at = new Date("2020-05-12T23:50:21.817Z");

  function setup() {
    const queryClient = new QueryClient();

    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return <Outlet context={{ user: testUser }} />;
        },
        children: [
          {
            path: "/userWords/:userWordId",
            Component: function () {
              return (
                <QueryClientProvider client={queryClient}>
                  <UserWord />
                </QueryClientProvider>
              );
            },
          },
        ],
      },
    ]);

    return {
      user: userEvent.setup(),
      ...render(<Stub initialEntries={[`/userWords/${userWordId}`]} />),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders word, origin, phonetics, meanings, license, source urls, and images", async () => {
    const json = {
      userWord: {
        created_at,
        learned: true,
        images: [
          { src: "/image1", caption: "Image 1" },
          { src: "/image2", caption: "Image 2" },
        ],
        word: {
          details: [
            {
              word: "word",
              phonetic: "/wɜːd/",
              origin: "The foundation of a language.",
              phonetics: [
                {
                  text: "/wɜːd/",
                  audio: "",
                },
                {
                  text: "/wɝd/",
                  audio:
                    "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3",
                  sourceUrl:
                    "https://commons.wikimedia.org/w/index.php?curid=1197728",
                  license: {
                    name: "BY-SA 3.0",
                    url: "https://creativecommons.org/licenses/by-sa/3.0",
                  },
                },
              ],
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [
                    {
                      definition: "News; tidings (used without an article).",
                      synonyms: [],
                      antonyms: [],
                      example: "Have you had any word from John yet?",
                    },
                    {
                      definition: "A promise; an oath or guarantee.",
                      synonyms: ["promise"],
                      antonyms: ["false promise"],
                      example:
                        "I give you my word that I will be there on time.",
                    },
                  ],
                  synonyms: ["Bible", "Logos", "vocable"],
                  antonyms: [],
                },
              ],
              license: {
                name: "CC BY-SA 3.0",
                url: "https://creativecommons.org/licenses/by-sa/3.0",
              },
              sourceUrls: ["https://en.wiktionary.org/wiki/word"],
            },
          ],
        },
      },
    };
    const mockGetUserWord = vi
      .spyOn(userWordService, "getUserWord")
      .mockImplementation(async () => {
        return { json, status };
      });

    const { asFragment } = setup();

    const createdAt = await screen.findByText(
      json.userWord.created_at.toLocaleString()
    );
    const word = screen.getByRole("heading", { name: "word" });
    const phonetic = screen.getByText("/wɝd/");
    const origin = screen.getByText("The foundation of a language.");
    const phoneticSourceURl = screen.getByRole("link", {
      name: "Phonetic Source",
    });
    const phoneticLicenseName = screen.getByText("BY-SA 3.0");
    const phoneticLicenseUrl = screen.getByRole("link", {
      name: "Phonetic License",
    });
    const partOfSpeech = screen.getByText("noun");
    const definition1 = screen.getByText(
      "News; tidings (used without an article)."
    );
    const example1 = screen.getByText("Have you had any word from John yet?");
    const definition2 = screen.getByText("A promise; an oath or guarantee.");
    const example2 = screen.getByText(
      "I give you my word that I will be there on time."
    );
    const synonym1 = screen.getByText("promise");
    const synonym2 = screen.getByText("Bible");
    const synonym3 = screen.getByText("Logos");
    const synonym4 = screen.getByText("vocable");
    const antonym1 = screen.getByText("false promise");
    const wordLicenseName = screen.getByText("CC BY-SA 3.0");
    const wordLicenseUrl = screen.getByRole("link", {
      name: "Word License",
    });
    const wordSourceUrl = screen.getByRole("link", { name: "Word Source" });
    const imageCarousel = screen.getByTestId("image-carousel");
    const pronounciationButton = screen.getByRole("button", {
      name: "Pronounce word",
    });
    const loading = screen.queryByTestId("loading");
    const error = screen.queryByTestId("error");
    expect(createdAt).toBeInTheDocument();
    expect(word).toBeInTheDocument();
    expect(phonetic).toBeInTheDocument();
    expect(origin).toBeInTheDocument();
    expect(phoneticSourceURl).toBeInTheDocument();
    expect(phoneticLicenseName).toBeInTheDocument();
    expect(phoneticLicenseUrl).toBeInTheDocument();
    expect(partOfSpeech).toBeInTheDocument();
    expect(definition1).toBeInTheDocument();
    expect(example1).toBeInTheDocument();
    expect(definition2).toBeInTheDocument();
    expect(example2).toBeInTheDocument();
    expect(synonym1).toBeInTheDocument();
    expect(synonym2).toBeInTheDocument();
    expect(synonym3).toBeInTheDocument();
    expect(synonym4).toBeInTheDocument();
    expect(antonym1).toBeInTheDocument();
    expect(wordLicenseName).toBeInTheDocument();
    expect(wordLicenseUrl).toBeInTheDocument();
    expect(wordSourceUrl).toBeInTheDocument();
    expect(imageCarousel).toBeInTheDocument();
    expect(pronounciationButton).toBeInTheDocument();
    expect(loading).not.toBeInTheDocument();
    expect(error).not.toBeInTheDocument();
    expect(mockGetUserWord).toHaveBeenCalledTimes(1);
    expect(mockGetUserWord).toHaveBeenCalledWith({
      userId: testUser.id,
      userWordId,
    });
    expect(asFragment()).toMatchSnapshot();
  });

  describe("learned", () => {
    it("tells the user that they already learned the word when learned is true", async () => {
      const json = {
        userWord: {
          created_at,
          learned: true,
          images: [],
          word: {
            details: [
              {
                word: "word",
                meanings: [
                  {
                    partOfSpeech: "noun",
                    definitions: [
                      {
                        definition: "News; tidings (used without an article).",
                        synonyms: [],
                        antonyms: [],
                        example: "Have you had any word from John yet?",
                      },
                      {
                        definition: "A promise; an oath or guarantee.",
                        synonyms: ["promise"],
                        antonyms: ["false promise"],
                        example:
                          "I give you my word that I will be there on time.",
                      },
                    ],
                    synonyms: ["Bible", "Logos", "vocable"],
                    antonyms: [],
                  },
                ],
              },
            ],
          },
        },
      };
      vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
        return { json, status };
      });

      setup();

      const learned = await screen.findByText("Learned word");
      expect(learned).toBeInTheDocument();
    });

    it("tells the user that they have not learned the word when learned is false", async () => {
      const json = {
        userWord: {
          created_at,
          learned: false,
          images: [],
          word: {
            details: [
              {
                word: "word",
                meanings: [
                  {
                    partOfSpeech: "noun",
                    definitions: [
                      {
                        definition: "News; tidings (used without an article).",
                        synonyms: [],
                        antonyms: [],
                        example: "Have you had any word from John yet?",
                      },
                      {
                        definition: "A promise; an oath or guarantee.",
                        synonyms: ["promise"],
                        antonyms: ["false promise"],
                        example:
                          "I give you my word that I will be there on time.",
                      },
                    ],
                    synonyms: ["Bible", "Logos", "vocable"],
                    antonyms: [],
                  },
                ],
              },
            ],
          },
        },
      };
      vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
        return { json, status };
      });
      setup();

      const notLearned = await screen.findByText("Word not learned");
      expect(notLearned).toBeInTheDocument();
    });
  });

  describe("phonetics", () => {
    it("renders a phonetic when phonetics is available but phonetic is not available", async () => {
      const json = {
        userWord: {
          created_at,
          learned: false,
          images: [],
          details: [
            {
              id: "1",
              word: "word",
              phonetics: [
                {
                  text: "/wɜːd/",
                  audio: "",
                },
                {
                  text: "/wɝd/",
                  audio:
                    "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3",
                  sourceUrl:
                    "https://commons.wikimedia.org/w/index.php?curid=1197728",
                  license: {
                    name: "BY-SA 3.0",
                    url: "https://creativecommons.org/licenses/by-sa/3.0",
                  },
                },
              ],
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [
                    {
                      definition: "News; tidings (used without an article).",
                      synonyms: [],
                      antonyms: [""],
                      example: "Have you had any word from John yet?",
                    },
                    {
                      definition: "A promise; an oath or guarantee.",
                      synonyms: ["promise"],
                      antonyms: ["false promise"],
                      example:
                        "I give you my word that I will be there on time.",
                    },
                  ],
                  synonyms: ["Bible", "Logos", "vocable"],
                  antonyms: [],
                },
              ],
            },
          ],
        },
      };
      vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
        return { json, status };
      });

      setup();

      const phonetic = screen.queryByText("/wɜːd/");

      expect(phonetic).not.toBeInTheDocument();
    });

    it("renders a phonetic when phonetic is available but phonetic is not available", async () => {
      const json = {
        created_at,
        learned: false,
        images: [],
        userWord: [
          {
            id: "1",
            word: "word",
            phonetic: "/wɜːd/",
            meanings: [
              {
                partOfSpeech: "noun",
                definitions: [
                  {
                    definition: "News; tidings (used without an article).",
                    synonyms: [],
                    antonyms: [""],
                    example: "Have you had any word from John yet?",
                  },
                  {
                    definition: "A promise; an oath or guarantee.",
                    synonyms: ["promise"],
                    antonyms: ["false promise"],
                    example: "I give you my word that I will be there on time.",
                  },
                ],
                synonyms: ["Bible", "Logos", "vocable"],
                antonyms: [],
              },
            ],
          },
        ],
      };
      vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
        return { json, status };
      });

      setup();

      const phonetic = screen.queryByText("/wɜːd/");

      expect(phonetic).not.toBeInTheDocument();
    });

    it("does not render a phonetic when not available", async () => {
      const json = {
        userWord: {
          created_at,
          learned: false,
          images: [],
          details: [
            {
              id: "1",
              word: "word",
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [
                    {
                      definition: "News; tidings (used without an article).",
                      synonyms: [],
                      antonyms: [""],
                      example: "Have you had any word from John yet?",
                    },
                    {
                      definition: "A promise; an oath or guarantee.",
                      synonyms: ["promise"],
                      antonyms: ["false promise"],
                      example:
                        "I give you my word that I will be there on time.",
                    },
                  ],
                  synonyms: ["Bible", "Logos", "vocable"],
                  antonyms: [],
                },
              ],
            },
          ],
        },
      };
      vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
        return { json, status };
      });

      setup();

      const phonetic = screen.queryByText("/wɜːd/");

      expect(phonetic).not.toBeInTheDocument();
    });
  });

  it("does not render origin when not available", async () => {
    const json = {
      userWord: {
        created_at,
        learned: false,
        images: [],
        details: [
          {
            id: "1",
            word: "word",
            meanings: [
              {
                partOfSpeech: "noun",
                definitions: [
                  {
                    definition: "News; tidings (used without an article).",
                    synonyms: [],
                    antonyms: [""],
                    example: "Have you had any word from John yet?",
                  },
                  {
                    definition: "A promise; an oath or guarantee.",
                    synonyms: ["promise"],
                    antonyms: ["false promise"],
                    example: "I give you my word that I will be there on time.",
                  },
                ],
                synonyms: ["Bible", "Logos", "vocable"],
                antonyms: [],
              },
            ],
          },
        ],
      },
    };
    vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
      return { json, status };
    });

    setup();

    const origin = screen.queryByText("The foundation of a language.");
    expect(origin).not.toBeInTheDocument();
  });

  it("does not render audio pronounciation when not available", () => {
    const json = {
      userWord: {
        created_at,
        learned: false,
        images: [],
        details: [
          {
            id: "1",
            word: "word",
            phonetics: [
              {
                text: "/wɜːd/",
                audio: "",
              },
              {
                text: "/wɝd/",
                audio: "",
                sourceUrl:
                  "https://commons.wikimedia.org/w/index.php?curid=1197728",
                license: {
                  name: "BY-SA 3.0",
                  url: "https://creativecommons.org/licenses/by-sa/3.0",
                },
              },
            ],
            meanings: [
              {
                partOfSpeech: "noun",
                definitions: [
                  {
                    definition: "News; tidings (used without an article).",
                    synonyms: [],
                    antonyms: [""],
                    example: "Have you had any word from John yet?",
                  },
                  {
                    definition: "A promise; an oath or guarantee.",
                    synonyms: ["promise"],
                    antonyms: ["false promise"],
                    example: "I give you my word that I will be there on time.",
                  },
                ],
                synonyms: ["Bible", "Logos", "vocable"],
                antonyms: [],
              },
            ],
          },
        ],
      },
    };
    vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
      return { json, status };
    });

    setup();

    const pronounciationButton = screen.queryByRole("button", {
      name: "Pronounce word",
    });
    expect(pronounciationButton).not.toBeInTheDocument();
  });

  it("does not render licenses when not available", async () => {
    const json = {
      userWord: {
        created_at,
        learned: false,
        images: [],
        word: {
          details: [
            {
              id: "1",
              word: "word",
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [
                    {
                      definition: "News; tidings (used without an article).",
                      synonyms: [],
                      antonyms: [""],
                      example: "Have you had any word from John yet?",
                    },
                    {
                      definition: "A promise; an oath or guarantee.",
                      synonyms: ["promise"],
                      antonyms: ["false promise"],
                      example:
                        "I give you my word that I will be there on time.",
                    },
                  ],
                  synonyms: ["Bible", "Logos", "vocable"],
                  antonyms: [],
                },
              ],
              sourceUrls: ["https://en.wiktionary.org/wiki/word"],
            },
          ],
        },
      },
    };
    vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
      return { json, status };
    });

    setup();

    const phoneticLicenseName = screen.queryByText("BY-SA 3.0");
    const phoneticLicenseUrl = screen.queryByRole("link", {
      name: "Phonetic License URL",
    });
    const wordLicenseName = screen.queryByText("CC BY-SA 3.0");
    const wordLicenseUrl = screen.queryByRole("link", {
      name: "Word License URL",
    });

    expect(phoneticLicenseName).not.toBeInTheDocument();
    expect(phoneticLicenseUrl).not.toBeInTheDocument();
    expect(wordLicenseName).not.toBeInTheDocument();
    expect(wordLicenseUrl).not.toBeInTheDocument();
  });

  it("does not render source urls when not available", async () => {
    const json = {
      userWord: {
        created_at,
        learned: false,
        images: [],
        word: {
          details: [
            {
              id: "1",
              word: "word",
              origin: "The foundation of a language.",
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [
                    {
                      definition: "News; tidings (used without an article).",
                      synonyms: [],
                      antonyms: [""],
                      example: "Have you had any word from John yet?",
                    },
                    {
                      definition: "A promise; an oath or guarantee.",
                      synonyms: ["promise"],
                      antonyms: ["false promise"],
                      example:
                        "I give you my word that I will be there on time.",
                    },
                  ],
                  synonyms: ["Bible", "Logos", "vocable"],
                  antonyms: [],
                },
              ],
              license: {
                name: "CC BY-SA 3.0",
                url: "https://creativecommons.org/licenses/by-sa/3.0",
              },
            },
          ],
        },
      },
    };
    vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
      return { json, status };
    });

    setup();

    const phoneticSourceURl = screen.queryByRole("link", {
      name: "Phonetic Source URL",
    });
    const wordSourceUrl = screen.queryByRole("link", {
      name: "Word Source URL",
    });

    expect(phoneticSourceURl).not.toBeInTheDocument();
    expect(wordSourceUrl).not.toBeInTheDocument();
  });

  it("does not render images are not available", async () => {
    const json = {
      userWord: {
        created_at,
        learned: false,
        images: [],
        word: {
          details: [
            {
              id: "1",
              word: "word",
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [
                    {
                      definition: "News; tidings (used without an article).",
                      synonyms: [],
                      antonyms: [""],
                      example: "Have you had any word from John yet?",
                    },
                    {
                      definition: "A promise; an oath or guarantee.",
                      synonyms: ["promise"],
                      antonyms: ["false promise"],
                      example:
                        "I give you my word that I will be there on time.",
                    },
                  ],
                  synonyms: ["Bible", "Logos", "vocable"],
                  antonyms: [],
                },
              ],
            },
          ],
        },
      },
    };
    vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
      return { json, status };
    });

    setup();

    const images = screen.queryAllByRole("img");
    expect(images).toHaveLength(0);
  });

  it("plays audio to pronounce word when available", async () => {
    const json = {
      userWord: {
        created_at,
        learned: false,
        images: [],
        word: {
          details: [
            {
              id: "1",
              word: "word",
              phonetic: "/wɜːd/",
              phonetics: [
                {
                  text: "/wɜːd/",
                  audio: "",
                },
                {
                  text: "/wɝd/",
                  audio:
                    "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3",
                  sourceUrl:
                    "https://commons.wikimedia.org/w/index.php?curid=1197728",
                  license: {
                    name: "BY-SA 3.0",
                    url: "https://creativecommons.org/licenses/by-sa/3.0",
                  },
                },
              ],
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [
                    {
                      definition: "News; tidings (used without an article).",
                      synonyms: [],
                      antonyms: [""],
                      example: "Have you had any word from John yet?",
                    },
                    {
                      definition: "A promise; an oath or guarantee.",
                      synonyms: ["promise"],
                      antonyms: ["false promise"],
                      example:
                        "I give you my word that I will be there on time.",
                    },
                  ],
                  synonyms: ["Bible", "Logos", "vocable"],
                  antonyms: [],
                },
              ],
            },
          ],
        },
      },
    };
    vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
      return { json, status };
    });
    const mockPlay = vi.fn();
    const mockCtor = vi.fn();
    globalThis.Audio = mockCtor.mockImplementation(() => {
      return {
        play: mockPlay,
      };
    });
    const user = userEvent.setup();

    setup();
    const audioButton = await screen.findByRole("button", {
      name: "Pronounce word",
    });
    await user.click(audioButton);

    expect(mockCtor).toHaveBeenCalledTimes(1);
    expect(mockCtor).toHaveBeenCalledWith(
      "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3"
    );
    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(mockPlay).toHaveBeenCalledWith();
  });

  it("returns loading component when loading", async () => {
    const json = {
      userWord: {
        created_at,
        learned: false,
        images: [],
        word: {
          details: [
            {
              id: "1",
              word: "word",
              phonetic: "/wɜːd/",
              origin: "The foundation of a language.",
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [
                    {
                      definition: "News; tidings (used without an article).",
                      synonyms: [],
                      antonyms: [],
                      example: "Have you had any word from John yet?",
                    },
                    {
                      definition: "A promise; an oath or guarantee.",
                      synonyms: ["promise"],
                      antonyms: ["false promise"],
                      example:
                        "I give you my word that I will be there on time.",
                    },
                  ],
                  synonyms: ["Bible", "Logos", "vocable"],
                  antonyms: [],
                },
              ],
            },
          ],
        },
      },
    };
    const delay = 50;
    vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ json, status });
        }, delay);
      });
    });

    setup();

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("returns error 500 page when there is an error", async () => {
    const message = "Server Error.";
    vi.spyOn(userWordService, "getUserWord").mockImplementation(async () => {
      return Promise.reject({ message, status: 500 });
    });

    setup();

    const error = await screen.findByTestId("error-500");
    expect(error).toHaveTextContent(message);
  });
});
