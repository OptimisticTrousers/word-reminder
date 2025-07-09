import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CondensedWord } from "./CondensedWord";

describe("CondensedWord", () => {
  const details = [
    {
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
        },
      ],
      meanings: [
        {
          partOfSpeech: "noun",
          definitions: [
            {
              definition: "News; tidings (used without an article).",
              example: "Have you had any word from John yet?",
            },
            {
              definition:
                "An order; a request or instruction; an expression of will.",
              synonyms: ["promise"],
              antonyms: ["false promise"],
              example: "Don't fire till I give the word",
            },
          ],
          synonyms: ["Bible", "Logos", "vocable"],
          antonyms: [],
        },
        {
          partOfSpeech: "verb",
          definitions: [
            {
              definition:
                "To say or write (something) using particular words; to phrase (something).",
              example: "I’m not sure how to word this letter to the council.",
            },
            {
              definition: "To flatter with words, to cajole.",
            },
          ],
        },
        {
          partOfSpeech: "interjection",
          definitions: [
            {
              definition:
                "(stereotypically) An abbreviated form of word up; a statement of the acknowledgment of fact with a hint of nonchalant approval.",
            },
          ],
        },
      ],
    },
    {
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
          sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=1197728",
          license: {
            name: "BY-SA 3.0",
            url: "https://creativecommons.org/licenses/by-sa/3.0",
          },
        },
      ],
      meanings: [
        {
          partOfSpeech: "verb",
          definitions: [
            {
              definition: "(except in set phrases) To be, become, betide.",
              example: "Well worth thee, me friend.",
            },
          ],
        },
      ],
    },
  ];

  it("renders meanings with part of speech, definitions, examples only", async () => {
    const { asFragment } = render(<CondensedWord details={details} />);

    const phonetic = screen.getAllByText("/wɜːd/");
    const nounPartOfSpeech = screen.getByText("noun");
    const definition1 = screen.getByText(
      "News; tidings (used without an article)."
    );
    const example1 = screen.getByText("Have you had any word from John yet?");
    const definition2 = screen.getByText(
      "An order; a request or instruction; an expression of will."
    );
    const example2 = screen.getByText("Don't fire till I give the word");
    const verbPartOfSpeech = screen.getAllByText("verb");
    const definition3 = screen.getByText(
      "To say or write (something) using particular words; to phrase (something)."
    );
    const example3 = screen.getByText(
      "I’m not sure how to word this letter to the council."
    );
    const definition4 = screen.getByText("To flatter with words, to cajole.");
    const interjectionPartOfSpeech = screen.getByText("interjection");
    const definition5 = screen.getByText(
      "(stereotypically) An abbreviated form of word up; a statement of the acknowledgment of fact with a hint of nonchalant approval."
    );
    const definition6 = screen.getByText(
      "(except in set phrases) To be, become, betide."
    );
    const word = screen.queryByRole("heading", { name: "word" });
    const link = screen.queryByRole("link");
    const example4 = screen.queryByText("Well worth thee, me friend.");
    const synonym1 = screen.queryByText("promise");
    const synonym2 = screen.queryByText("Bible");
    const synonym3 = screen.queryByText("Logos");
    const synonym4 = screen.queryByText("vocable");
    const antonym1 = screen.queryByText("false promise");

    expect(word).not.toBeInTheDocument();
    expect(link).not.toBeInTheDocument();
    expect(synonym1).not.toBeInTheDocument();
    expect(synonym2).not.toBeInTheDocument();
    expect(synonym3).not.toBeInTheDocument();
    expect(synonym4).not.toBeInTheDocument();
    expect(antonym1).not.toBeInTheDocument();
    expect(phonetic).toHaveLength(4);
    expect(nounPartOfSpeech).toBeInTheDocument();
    expect(definition1).toBeInTheDocument();
    expect(example1).toBeInTheDocument();
    expect(definition2).toBeInTheDocument();
    expect(example2).toBeInTheDocument();
    expect(verbPartOfSpeech).toHaveLength(2);
    expect(definition3).toBeInTheDocument();
    expect(example3).toBeInTheDocument();
    expect(definition4).toBeInTheDocument();
    expect(interjectionPartOfSpeech).toBeInTheDocument();
    expect(definition5).toBeInTheDocument();
    expect(definition6).toBeInTheDocument();
    expect(example4).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("plays audio to pronounce word when available", async () => {
    const details = [
      {
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
          },
        ],
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition: "News; tidings (used without an article).",
                example: "Have you had any word from John yet?",
              },
            ],
          },
        ],
      },
      {
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
          },
        ],
        meanings: [
          {
            partOfSpeech: "verb",
            definitions: [
              {
                definition: "(except in set phrases) To be, become, betide.",
                example: "Well worth thee, me friend.",
              },
            ],
          },
        ],
      },
    ];
    const mockPlay = vi.fn();
    const mockCtor = vi.fn();
    globalThis.Audio = mockCtor.mockImplementation(() => {
      return {
        play: mockPlay,
      };
    });
    const user = userEvent.setup();

    render(<CondensedWord details={details} />);
    const audioButton = screen.getAllByRole("button", {
      name: "Pronounce word",
    })[0];
    await user.click(audioButton);

    expect(mockCtor).toHaveBeenCalledTimes(1);
    expect(mockCtor).toHaveBeenCalledWith(
      "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3"
    );
    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(mockPlay).toHaveBeenCalledWith();
  });
});
