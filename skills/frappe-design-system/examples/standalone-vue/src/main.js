import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import UsersPage from './UsersPage.vue'
import DashboardPage from './DashboardPage.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/users' },
    { path: '/users', component: UsersPage },
    { path: '/dashboard', component: DashboardPage },
  ],
})

createApp(App).use(router).mount('#app')
