import Vue from 'vue'
import Vuex from 'vuex'
import Cookies from './../services/Cookies.js'
  
const cookies = new Cookies()

Vue.use(Vuex)

const state = {
  units: 'english',
  currentLocation: {
    latitude: '',
    longitude: ''
  }
}

if (cookies.getCookie('units').length == 0) {
  cookies.setCookie('units', state.units, 336)
}
else if (cookies.getCookie('units').length > 0 && cookies.getCookie('units') != state.units) {
  state.units = cookies.getCookie('units')
}

const mutations = {
  unitsChanger: function(state, value) {
    state.units = value
    cookies.setCookie('units', value, 336)    
  },
  currentLocationChanger: function(state, value) {
    state.currentLocation = value
  }
}

export default new Vuex.Store({
  state,
  mutations
})
