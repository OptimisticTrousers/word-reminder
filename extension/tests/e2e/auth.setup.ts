import { test as setup } from "./fixtures";
import { testUser, VITE_API_DOMAIN } from "./helpers";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ request }) => {
  await request.delete(`${VITE_API_DOMAIN}/testing/reset`);
  await request.post(`${VITE_API_DOMAIN}/users`, {
    data: testUser,
  });
  await request.post(`${VITE_API_DOMAIN}/sessions`, {
    data: testUser,
  });
  await request.storageState({ path: authFile });
});
