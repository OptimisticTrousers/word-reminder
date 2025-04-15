import {
  createContextMenuService,
  createServiceWorkerService,
  createWebpushService,
} from "./helpers";

const serviceWorkerService = createServiceWorkerService(
  createWebpushService,
  createContextMenuService
);

declare const self: ServiceWorkerGlobalScope;

(async () => {
  await serviceWorkerService.__init__(self);
})();
