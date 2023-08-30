import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Settings Page",
    children: [
      {
        path: "/general",
        component: () => import("./General.vue"),
        name: "General",
      },
      {
        path: "/features",
        component: () => import("./Features.vue"),
        name: "Features",
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
