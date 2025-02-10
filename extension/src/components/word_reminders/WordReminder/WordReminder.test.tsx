import { render, screen } from "@testing-library/react";

import { WordReminder } from "./WordReminder";
import { Mock } from "vitest";
import userEvent from "@testing-library/user-event";

vi.mock("../../modals/UpdateWordReminderModal", () => {
  return {
    UpdateWordReminderModal: function ({ toggleModal }: { toggleModal: Mock }) {
      return (
        <div data-testid="update-word-reminder-modal">
          <button onClick={toggleModal}>Close</button>
        </div>
      );
    },
  };
});

vi.mock("../../modals/DeleteWordReminderModal", () => {
  return {
    DeleteWordReminderModal: function ({ toggleModal }: { toggleModal: Mock }) {
      return (
        <div data-testid="delete-word-reminder-modal">
          <button onClick={toggleModal}>Close</button>
        </div>
      );
    },
  };
});

vi.mock("../../words/UserWord", () => {
  return {
    UserWord: function () {
      return <div data-testid="user-word"></div>;
    },
  };
});

describe("wordReminder component", () => {
  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const milieuWordId = "1";
  const milieuJson = [
    {
      word: "milieu",
      meanings: [
        {
          partOfSpeech: "noun",
          definitions: [{ definition: "A person's social environment." }],
        },
      ],
      phonetics: [],
    },
  ];

  const clemencyWordId = "2";
  const clemencyJson = [
    {
      word: "clemency",
      meanings: [
        {
          partOfSpeech: "noun",
          definitions: [{ definition: "Mercy; lenience." }],
        },
      ],
      phonetics: [],
    },
  ];

  const helloWordId = "3";
  const helloJson = [
    {
      word: "hello",
      phonetic: "həˈləʊ",
      phonetics: [
        {
          text: "həˈləʊ",
          audio:
            "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3",
        },
        {
          text: "hɛˈləʊ",
        },
      ],
      meanings: [
        {
          partOfSpeech: "exclamation",
          definitions: [
            {
              definition:
                "used as a greeting or to begin a phone conversation.",
              example: "hello there, Katie!",
              synonyms: [],
              antonyms: [],
            },
          ],
        },
        {
          partOfSpeech: "noun",
          definitions: [
            {
              definition: "an utterance of ‘hello’; a greeting.",
              example: "she was getting polite nods and hellos from people",
              synonyms: [],
              antonyms: [],
            },
          ],
        },
        {
          partOfSpeech: "verb",
          definitions: [
            {
              definition: "say or shout ‘hello’.",
              example: "I pressed the phone button and helloed",
              synonyms: [],
              antonyms: [],
            },
          ],
        },
      ],
    },
  ];

  const userWord1 = {
    id: "1",
    user_id: sampleUser1.id,
    word_id: helloWordId,
    details: helloJson,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: "2",
    user_id: sampleUser1.id,
    word_id: clemencyWordId,
    details: clemencyJson,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord3 = {
    id: "3",
    user_id: sampleUser1.id,
    word_id: milieuWordId,
    details: milieuJson,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWords = [userWord1, userWord2, userWord3];

  it("renders the word reminder", async () => {
    const wordReminder = {
      id: "1",
      user_id: sampleUser1.id,
      finish: new Date(Date.now() + 1000), // make sure date comes after current date
      reminder: "every 2 hours",
      is_active: false,
      has_reminder_onload: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const searchParams = new URLSearchParams();

    const { asFragment } = render(
      <WordReminder
        searchParams={searchParams}
        wordReminder={{ ...wordReminder, user_words: userWords }}
      />
    );

    const id = screen.getByText(wordReminder.id);
    const reminder = screen.getByText(
      `This word reminder will remind you of these words ${wordReminder.reminder}`
    );
    const isActive = screen.getByText(
      "Active (whether the word reminder will actively remind you of the words in it): No"
    );
    const hasReminderOnload = screen.getByText(
      "Has Reminder Onload (reminds you of these words when you open your browser): No"
    );
    const finish = screen.getByText(
      `This word reminder will become inactive on ${wordReminder.finish.toLocaleString()}`
    );
    const updated_at = screen.getByText(
      `This word reminder was created on ${wordReminder.created_at.toLocaleString()}`
    );
    const created_at = screen.getByText(
      `This word reminder was updated on ${wordReminder.updated_at.toLocaleString()}`
    );
    const userWordEls = screen.getAllByTestId("user-word");
    expect(id).toBeInTheDocument();
    expect(reminder).toBeInTheDocument();
    expect(isActive).toBeInTheDocument();
    expect(hasReminderOnload).toBeInTheDocument();
    expect(finish).toBeInTheDocument();
    expect(updated_at).toBeInTheDocument();
    expect(created_at).toBeInTheDocument();
    expect(userWordEls).toHaveLength(3);
    expect(asFragment());
  });

  it("opens update modal when use clicks on update button", async () => {
    const wordReminder = {
      id: "1",
      user_id: sampleUser1.id,
      finish: new Date(Date.now() + 1000), // make sure date comes after current date
      reminder: "every 2 hours",
      is_active: false,
      has_reminder_onload: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const searchParams = new URLSearchParams();

    render(
      <WordReminder
        searchParams={searchParams}
        wordReminder={{ ...wordReminder, user_words: userWords }}
      />
    );
    const user = userEvent.setup();

    const updateButton = screen.getByRole("button", { name: "Update" });
    await user.click(updateButton);

    const modal = screen.getByTestId("update-word-reminder-modal");
    expect(modal).toBeInTheDocument();
  });

  it("opens delete modal when use clicks on delete button", async () => {
    const wordReminder = {
      id: "1",
      user_id: sampleUser1.id,
      finish: new Date(Date.now() + 1000), // make sure date comes after current date
      reminder: "every 2 hours",
      is_active: false,
      has_reminder_onload: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const searchParams = new URLSearchParams();

    render(
      <WordReminder
        searchParams={searchParams}
        wordReminder={{ ...wordReminder, user_words: userWords }}
      />
    );
    const user = userEvent.setup();

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    const modal = screen.getByTestId("delete-word-reminder-modal");
    expect(modal).toBeInTheDocument();
  });

  describe("isActive", () => {
    it("renders that the word reminder is active when true", async () => {
      const wordReminder = {
        id: "1",
        user_id: sampleUser1.id,
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        reminder: "every 2 hours",
        is_active: true,
        has_reminder_onload: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const searchParams = new URLSearchParams();

      const { asFragment } = render(
        <WordReminder
          searchParams={searchParams}
          wordReminder={{ ...wordReminder, user_words: userWords }}
        />
      );

      const id = screen.getByText(wordReminder.id);
      const reminder = screen.getByText(
        `This word reminder will remind you of these words ${wordReminder.reminder}`
      );
      const isActive = screen.getByText(
        "Active (whether the word reminder will actively remind you of the words in it): Yes"
      );
      const hasReminderOnload = screen.getByText(
        "Has Reminder Onload (reminds you of these words when you open your browser): No"
      );
      const finish = screen.getByText(
        `This word reminder will become inactive on ${wordReminder.finish.toLocaleString()}`
      );
      const updated_at = screen.getByText(
        `This word reminder was created on ${wordReminder.created_at.toLocaleString()}`
      );
      const created_at = screen.getByText(
        `This word reminder was updated on ${wordReminder.updated_at.toLocaleString()}`
      );
      const userWordEls = screen.getAllByTestId("user-word");
      expect(id).toBeInTheDocument();
      expect(reminder).toBeInTheDocument();
      expect(isActive).toBeInTheDocument();
      expect(hasReminderOnload).toBeInTheDocument();
      expect(finish).toBeInTheDocument();
      expect(updated_at).toBeInTheDocument();
      expect(created_at).toBeInTheDocument();
      expect(userWordEls).toHaveLength(3);
      expect(asFragment());
    });
  });

  it("renders that the word reminder will remind the user of the words in it when the user's browser is started when true", async () => {
    const wordReminder = {
      id: "1",
      user_id: sampleUser1.id,
      finish: new Date(Date.now() + 1000), // make sure date comes after current date
      reminder: "every 2 hours",
      is_active: false,
      has_reminder_onload: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const searchParams = new URLSearchParams();

    const { asFragment } = render(
      <WordReminder
        searchParams={searchParams}
        wordReminder={{ ...wordReminder, user_words: userWords }}
      />
    );

    const id = screen.getByText(wordReminder.id);
    const reminder = screen.getByText(
      `This word reminder will remind you of these words ${wordReminder.reminder}`
    );
    const isActive = screen.getByText(
      "Active (whether the word reminder will actively remind you of the words in it): No"
    );
    const hasReminderOnload = screen.getByText(
      "Has Reminder Onload (reminds you of these words when you open your browser): Yes"
    );
    const finish = screen.getByText(
      `This word reminder will become inactive on ${wordReminder.finish.toLocaleString()}`
    );
    const updated_at = screen.getByText(
      `This word reminder was created on ${wordReminder.created_at.toLocaleString()}`
    );
    const created_at = screen.getByText(
      `This word reminder was updated on ${wordReminder.updated_at.toLocaleString()}`
    );
    const userWordEls = screen.getAllByTestId("user-word");
    expect(id).toBeInTheDocument();
    expect(reminder).toBeInTheDocument();
    expect(isActive).toBeInTheDocument();
    expect(hasReminderOnload).toBeInTheDocument();
    expect(finish).toBeInTheDocument();
    expect(updated_at).toBeInTheDocument();
    expect(created_at).toBeInTheDocument();
    expect(userWordEls).toHaveLength(3);
    expect(asFragment());
  });
});
