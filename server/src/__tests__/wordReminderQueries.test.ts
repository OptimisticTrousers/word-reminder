import { WordReminderQueries } from "../db/wordReminderQueries";
import { UserQueries } from "../db/userQueries";
import { UserWordQueries } from "../db/userWordQueries";
import { WordQueries } from "../db/wordQueries";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("wordReminderQueries", () => {
  const userQueries = new UserQueries();
  const userWordQueries = new UserWordQueries();
  const wordReminderQueries = new WordReminderQueries();
  const wordQueries = new WordQueries();

  const sampleUser1 = {
    id: "1",
    username: "username",
    password: "password",
  };

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

  // option for including duplicate words in the auto create
  describe("create", () => {
    it("creates word reminder", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
      const clemencyUserWord = await userWordQueries.create({
        userId: sampleUser1.id,
        wordId: milieuWord.id,
        learned: false,
      });
      const milieuUserWord = await userWordQueries.create({
        userId: sampleUser1.id,
        wordId: clemencyWord.id,
        learned: false,
      });

      // const wordReminder = await wordReminderQueries.create(sampleUser1, [
      //   clemencyUserWord.id,
      //   milieuUserWord.id,
      // ]);

      // expect(wordReminder).toEqual({
      //   id: 1,
      //   user_id: sampleUser1.id,
      //   from: expect.any(Date),
      //   to: expect.any(Date),
      //   created_at: expect.any(Date),
      //   updated_at: expect.any(Date),
      // });
    });

    it("does nothing when the word reminder already exists", async () => {
      const clemencyWord = await wordQueries.create({ json: clemencyJson });
      const milieuWord = await wordQueries.create({ json: milieuJson });
      await userQueries.create({
        username: sampleUser1.username,
        password: sampleUser1.password,
      });
      const clemencyUserWord = await userWordQueries.create({
        userId: sampleUser1.id,
        wordId: milieuWord.id,
        learned: false,
      });
      const milieuUserWord = await userWordQueries.create({
        userId: sampleUser1.id,
        wordId: clemencyWord.id,
        learned: false,
      });
      // await wordReminderQueries.create(sampleUser1, [
      //   clemencyUserWord.id,
      //   milieuUserWord.id,
      // ]);

      // const wordReminder = await wordReminderQueries.create(sampleUser1, [
      //   clemencyUserWord.id,
      //   milieuUserWord.id,
      // ]);

      // expect(wordReminder).toEqual({
      //   id: 1,
      //   user_id: sampleUser1.id,
      //   from: expect.any(Date),
      //   to: expect.any(Date),
      //   created_at: expect.any(Date),
      //   updated_at: expect.any(Date),
      // });
    });
  });

  describe("autoCreate", () => {
    it("automatically creates word reminder", async () => {});
  });

  describe("delete", () => {
    it("deletes word reminder");

    it("does nothing if the word reminder does not exist");
  });

  describe("getById", () => {
    it("gets the word reminder by ID");
    it("returns undefined when the word reminder does not exist");
  });

  describe("getByUserId", () => {
    it("gets the word reminder by user ID");

    it("returns an empty list of rows if the user has no word reminders");
  });

  describe("update", () => {});
});
