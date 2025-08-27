import cron from "node-cron";
import { processRecurringTransactions } from "./jobs/transaction.job";
const scheduleJob = (name: string, time: string, job: Function) => {
  console.log(`Scheduling job: ${name} at ${time}`);

  return cron.schedule(
    time,
    async () => {
      try {
        await job();
        console.log(`${name} completed`);
      } catch (error) {
        console.error(`${name} failed`, error);
      }
    },
    {
      timezone: "UTC",
    }
  );
};

export const startJobs = () => {
  return [
    scheduleJob("Transactions", "0 0 * * *", processRecurringTransactions),
  ];
};
