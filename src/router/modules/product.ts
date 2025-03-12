export default {
  path: "/product",
  redirect: "/product/list",
  meta: {
    icon: "ri:product-hunt-line",
    title: "产品管理",
    rank: 3
  },
  children: [
    {
      path: "/product/list",
      name: "ProductList",
      component: () => import("@/views/product/productList/index.vue"),
      meta: {
        title: "产品列表",
        showParent: true
      }
    },
    {
      path: "/product/detail/:id",
      name: "ProductDetail",
      component: () => import("@/views/product/productDetail/index.vue"),
      meta: {
        title: "产品详情",
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
