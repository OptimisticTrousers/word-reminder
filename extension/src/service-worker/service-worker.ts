import {
  createContextMenuService,
  startServiceWorkerService,
  createWebpushService,
} from "./helpers";

declare const self: ServiceWorkerGlobalScope;

startServiceWorkerService(createWebpushService, createContextMenuService, self);
