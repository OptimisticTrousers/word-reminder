import PgBoss, { Job, StopOptions } from "pg-boss";

import { variables } from "../config/variables";

export class Scheduler {
  private boss: PgBoss;

  constructor() {
    this.boss = new PgBoss(
      variables.NODE_ENV === "test"
        ? variables.TEST_DATABASE_URL
        : variables.DATABASE_URL
    );
    this.boss.on("error", console.error);
  }

  async createQueue(name: string): Promise<void> {
    await this.boss.createQueue(name);
  }

  async sendAfter(
    name: string,
    args: { [key: string]: unknown },
    date: Date
  ): Promise<string | null> {
    const id = await this.boss.sendAfter(name, args, { retryLimit: 3 }, date);

    return id;
  }

  async start(): Promise<void> {
    await this.boss.start();
  }

  async stop(options: StopOptions) {
    await this.boss.stop(options);
  }

  async work<T>(
    name: string,
    handler: (jobs: Job<T>[]) => Promise<void>
  ): Promise<void> {
    await this.boss.work(name, handler);
  }
}

export const scheduler = new Scheduler();
