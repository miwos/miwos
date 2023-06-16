import PatchView from '@/views/PatchView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'patch',
      component: PatchView,
    },
  ],
})

export default router
