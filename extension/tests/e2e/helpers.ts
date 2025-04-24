import path from "path";
import { chromium } from "@playwright/test";
import { fileURLToPath } from "url";

export async function createBrowserContext() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pathToExtension = path.join(__dirname, "..", "..", "dist");
  const userDataDir = "/tmp/test-user-data-dir";
  const browser = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  return browser;
}
