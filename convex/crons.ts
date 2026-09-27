import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
// Re-read the GitHub repo every 5 minutes (a push webhook at /sync/github makes it instant).
crons.interval("sync knowledge base", { minutes: 5 }, internal.sync.syncRepo, {});
export default crons;
