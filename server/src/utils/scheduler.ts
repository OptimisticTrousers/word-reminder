import PgBoss, { Job, StopOptions } from "pg-boss";

import { variables } from "../config/variables";

const { DATABASE_URL, NODE_ENV, TEST_DATABASE_URL } = variables;

export const scheduler = (function (boss: PgBoss) {
  boss.on("error", console.error);

  const createQueue = async (name: string): Promise<void> => {
    await boss.createQueue(name);
  };

  const sendAfter = async (
    name: string,
    args: { [key: string]: unknown },
    date: Date
  ): Promise<string | null> => {
    const id = await boss.sendAfter(name, args, { retryLimit: 3 }, date);

    return id;
  };

  const start = async (): Promise<void> => {
    await boss.start();
  };

  const stop = async (options: StopOptions) => {
    await boss.stop(options);
  };

  const work = async <T>(
    name: string,
    handler: (jobs: Job<T>[]) => Promise<void>
  ): Promise<void> => {
    await boss.work(name, handler);
  };

  return { createQueue, sendAfter, start, stop, work };
})(new PgBoss(NODE_ENV === "test" ? TEST_DATABASE_URL : DATABASE_URL));
