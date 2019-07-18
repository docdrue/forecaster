import Vue from 'vue'
import VueRouter from 'vue-router'

// Import templates.
import Index from './templates/Index.vue'
import Help from './templates/Help.vue'

Vue.use(VueRouter);

// Add routs.
const routes = [
  { path: '/', component: Index },
  { path: '/help', component: Help }
]

const router = new VueRouter({
  base: '/',
  mode: 'abstract',
  routes: routes
})

const app = new Vue({
  router
}).$mount('#app')
