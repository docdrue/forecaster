import Vue from 'vue'
import VueRouter from 'vue-router'

// Import views.
import Index from '../views/Index.vue'
import AreaOfForecast from '../views/AreaOfForecast.vue'
import ErrorPage from '../views/ErrorPage.vue'

Vue.use(VueRouter);

// Add routs.
const routes = [
  { name: 'Index', path: '/', component: Index },
  { name: 'AreaOfForecast', path: '/area-of-forecast/:zmw', component: AreaOfForecast },
  { name: 'ErrorPage', path: '*', component: ErrorPage }
];

export const router =  new VueRouter({
  base: __dirname,
  mode: 'history',
  routes: routes
});
