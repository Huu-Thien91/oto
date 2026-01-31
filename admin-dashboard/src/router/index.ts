// Sử dụng 'import type' để nhập kiểu dữ liệu
import type { RouteRecordRaw } from 'vue-router'; // Sử dụng 'import type' cho kiểu dữ liệu
import { createRouter, createWebHistory } from 'vue-router';
import CarImageManagement from '../pages/CarImageManagement.vue';
import CarManagement from '../pages/CarManagement.vue';
import CarWishlist from '../pages/CarWishlist.vue';
import Dashboard from '../pages/Dashboard.vue';
import HomeView from '../pages/HomeView.vue';
import CarDetailView from '../pages/ND/CarDetailView.vue';
import OrderItems from '../pages/OrderItems.vue';
import OrderManagement from '../pages/OrderManagement.vue';
import PaymentTransaction from '../pages/PaymentTransaction.vue';
import PromotionManagement from '../pages/PromotionManagement.vue';
import UserLayout from '../pages/UserLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/admin/dashboard',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/admin/carmanagement',
    name: 'carmanagement',
    component: CarManagement
  },
   {
    path: '/admin/OrderManagement',
    name: 'OrderManagement',
    component: OrderManagement
  },
   {
    path: '/admin/OrderItems',
    name: 'OrderItems',
    component: OrderItems
  },
     {
    path: '/admin/PromotionManagement',
    name: 'PromotionManagement',
    component: PromotionManagement
  },
    {
    path: '/admin/CarImageManagement',
    name: 'CarImageManagement',
    component: CarImageManagement
  },
    {
    path: '/admin/PaymentTransaction',
    name: 'PaymentTransaction',
    component: PaymentTransaction
  },
    {
    path: '/admin/CarWishlist',
    name: 'CarWishlist',
    component: CarWishlist
  },
    {
    path: '/',
    name: 'HomeView',
    component: HomeView
  },
  {
    path: '/UserLayout',
    name: 'UserLayout',
    component: UserLayout
  },
{
    // Cần thêm :id để nhận mã xe từ trang chủ
    path: '/car-detail/:id', 
    name: 'CarDetail', // Đặt tên là CarDetail để khớp với hàm viewDetail bạn đã viết
    component: CarDetailView,
    props: true
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
