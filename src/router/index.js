import Vue from 'vue'
import Router from 'vue-router'
import CodeGen from '@/components/CodeGen'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'CodeGen',
      component: CodeGen
    }
  ]
})
