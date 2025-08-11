import Vue from "vue";
import VueRouter from "vue-router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { getToken } from "@/utils/storage.js";
import echarts from "echarts";
Vue.prototype.$echarts = echarts;
import locale from "element-ui/lib/locale/lang/en";
Vue.use(ElementUI, { locale });
Vue.use(VueRouter);

const routes = [
  { path: "/", component: () => import(`@/views/login/Login.vue`) },
  { path: "/login", component: () => import(`@/views/login/Login.vue`) },
  {
    path: "/register",
    component: () => import(`@/views/register/Register.vue`)
  },
  {
    path: "/createNotice",
    component: () => import(`@/views/admin/CreateNotice.vue`),
    meta: { requireAuth: true }
  },
  {
    path: "/admin",
    component: () => import(`@/views/admin/Home.vue`),
    meta: { requireAuth: true },
    children: [
      {
        path: "/userManage",
        name: "User Management",
        icon: "el-icon-user-solid",
        component: () => import(`@/views/admin/UserManage.vue`),
        meta: { requireAuth: true }
      },
      {
        path: "/bookManage",
        name: "Book Management",
        icon: "el-icon-tickets",
        component: () => import(`@/views/admin/BookManage.vue`),
        meta: { requireAuth: true }
      },
      {
        path: "/bookOrderHistoryManage",
        name: "Borrowing Records",
        icon: "el-icon-view",
        component: () => import(`@/views/admin/BookOrderHistoryManage.vue`),
        meta: { requireAuth: true }
      },
      {
        path: "/bookshelfManage",
        name: "Bookshelf",
        icon: "el-icon-film",
        component: () => import(`@/views/admin/BookshelfManage.vue`),
        meta: { requireAuth: true }
      },
      {
        path: "/categoryManage",
        name: "Category",
        icon: "el-icon-share",
        component: () => import(`@/views/admin/CategoryManage.vue`),
        meta: { requireAuth: true }
      },
      {
        path: "/readerProposalManage",
        name: "Reader Suggestions",
        icon: "el-icon-edit-outline",
        component: () => import(`@/views/admin/ReaderProposalManage.vue`),
        meta: { requireAuth: true }
      },
      {
        path: "/noticeManage",
        name: "Announcement",
        icon: "el-icon-edit-outline",
        component: () => import(`@/views/admin/NoticeManage.vue`),
        meta: { requireAuth: true }
      }
    ]
  },
  {
    path: "/user",
    component: () => import(`@/views/user/Home.vue`),
    meta: { requireAuth: true },
    children: [
      {
        name: "Feedback",
        path: "/main",
        show: true,
        icon: "el-icon-chat-dot-round",
        component: () => import(`@/views/user/Main.vue`),
        meta: { requireAuth: true }
      },
      {
        name: "Borrow",
        path: "/bookOperation",
        show: true,
        icon: "el-icon-tickets",
        component: () => import(`@/views/user/BookOperation.vue`),
        meta: { requireAuth: true }
      },
      {
        name: "Borrow History",
        path: "/bookOrderHistory",
        show: true,
        icon: "el-icon-pie-chart",
        component: () => import(`@/views/user/BookOrderHistory.vue`),
        meta: { requireAuth: true }
      },
      {
        name: "Favorites",
        path: "/bookSave",
        show: true,
        icon: "el-icon-star-on",
        component: () => import(`@/views/user/BookSave.vue`),
        meta: { requireAuth: true }
      },
      {
        name: "Announcements",
        path: "/notice",
        show: true,
        icon: "el-icon-document-remove",
        component: () => import(`@/views/user/Notice.vue`),
        meta: { requireAuth: true }
      },
      {
        name: "公告详情",
        path: "/noticeDetail",
        show: false,
        icon: "el-icon-document-remove",
        component: () => import(`@/views/user/NoticeDetail.vue`),
        meta: { requireAuth: true }
      },
      {
        name: "我的中心",
        path: "/mySelf",
        show: false,
        icon: "el-icon-document-remove",
        component: () => import(`@/views/user/MySelf.vue`),
        meta: { requireAuth: true }
      },
      {
        name: "Smart Book Analysis",
        path: "/aiAssistant",
        show: true,
        icon: "el-icon-s-help",
        component: () => import(`@/views/user/AiAssistant.vue`),
        meta: { requireAuth: true }
      }
      // { name: 'Coze AI', path: "/cozeChat", show: true, icon: 'el-icon-s-help', component: () => import(`@/views/user/CozeChat.vue`), meta: { requireAuth: true } },
    ]
  }
];

const router = new VueRouter({
  routes,
  mode: "history"
});
router.beforeEach((to, from, next) => {
  if (to.meta.requireAuth) {
    const token = getToken();
    if (token !== null) {
      next();
    } else {
      next("/login");
    }
  } else {
    next();
  }
});
// import "vue-vibe";
export default router;
