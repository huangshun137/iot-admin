export default {
  path: "/OTA",
  redirect: "/OTA/package",
  meta: {
    icon: "ri-loop-right-line",
    title: "OTA",
    rank: 5
  },
  children: [
    {
      path: "/OTA/package",
      name: "OTAPackage",
      component: () => import("@/views/ota/package/index.vue"),
      meta: {
        title: "资源包"
      }
    },
    {
      path: "/OTA/task",
      name: "OTATask",
      component: () => import("@/views/ota/task/index.vue"),
      meta: {
        title: "任务列表"
      }
    }
  ]
} satisfies RouteConfigsTable;
