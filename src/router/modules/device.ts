export default {
  path: "/device",
  redirect: "/device/list",
  meta: {
    icon: "ri:device-line",
    title: "设备管理",
    rank: 4
  },
  children: [
    {
      path: "/device/list",
      name: "DeviceList",
      component: () => import("@/views/device/deviceList/index.vue"),
      meta: {
        title: "设备列表",
        showParent: true
      }
    },
    {
      path: "/device/detail/:id",
      name: "DeviceDetail",
      component: () => import("@/views/device/deviceDetail/index.vue"),
      meta: {
        title: "设备详情",
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
