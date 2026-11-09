import http from 'http';
import { AddressInfo } from 'net';
import { createExpressApp } from '../backend/app.ts';
import { DB } from '../backend/db.ts';

export interface TestContext {
  server: http.Server;
  baseUrl: string;
  close: () => Promise<void>;
  resetDb: () => void;
}

const INITIAL_USERS = JSON.parse(JSON.stringify(DB.users));
const INITIAL_TARGETS = JSON.parse(JSON.stringify(DB.targets));
const INITIAL_SCANS = JSON.parse(JSON.stringify(DB.scans));
const INITIAL_TRANSACTIONS = JSON.parse(JSON.stringify(DB.transactions));
const INITIAL_NOTIFICATIONS = JSON.parse(JSON.stringify(DB.notifications));

export function resetDatabase() {
  DB.users = JSON.parse(JSON.stringify(INITIAL_USERS));
  DB.targets = JSON.parse(JSON.stringify(INITIAL_TARGETS));
  DB.scans = JSON.parse(JSON.stringify(INITIAL_SCANS));
  DB.transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
  DB.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
  DB.referralRequests = [];
  DB.otpStore.clear();
}

export async function createTestServer(): Promise<TestContext> {
  const app = createExpressApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const close = () =>
    new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });

  return {
    server,
    baseUrl,
    close,
    resetDb: resetDatabase,
  };
}
