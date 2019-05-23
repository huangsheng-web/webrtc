import Vue from 'vue'
import Router from 'vue-router'

// import 组件
Vue.use(Router)

let router = new Router({
  // mode: 'history',
  base: '',
  routes: [
    {
      path: '/pc',
      name: 'index',
      component: () => import('@/components/pc.vue')
    },
    {
      path: '/phone',
      name: 'phone',
      component: () => import('@/components/phone.vue')
    },
    {
      path: '/home1',
      name: 'home1',
      component: () => import('@/components/home.vue')
    },
    {
      path: '/home2',
      name: 'home2',
      component: () => import('@/components/hom2.vue')
    }
  ]
})

export default router