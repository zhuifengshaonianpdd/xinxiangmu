import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/login'
import Home from '@/views/home'
Vue.use(VueRouter)
const routes = [
  { path: '/login', name: 'login', component: Login },
  {
    path: '/home',
    name: 'home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/material', name: 'material', component: () => import('@/views/material') },
      { path: '/account', name: 'account', component: () => import('@/views/account') },
      { path: '/welcome', name: 'welcome', component: () => import('@/views/welcome') },
      { path: '/article', name: 'article', component: () => import('@/views/article') },
      { path: '/articleadd', name: 'articleadd', component: () => import('@/views/articleadd') },
      { path: '/articleedit/:aid', name: 'articleedit', component: () => import('@/views/articleedit') }
    ]
  }
]
const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  let userinfo = window.sessionStorage.getItem('userinfo')
  if (!userinfo && to.path !== '/login') {
    return next('/login')
  }
  next()
})

export default router
