import Vue from 'vue'
import {router} from './src/router'

require("./src/styles/sass/main.scss");

const app = new Vue({
  router
}).$mount('#app-forecaster');
