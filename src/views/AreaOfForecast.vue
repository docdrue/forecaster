<template>
  <div>
    <div id="forecast">
      <div class="loading" v-show="loading">
        <svg class="load-spinner" viewBox="0 0 50 50">
        	<circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      	</svg>
      </div>
      
      <div v-if="error" class="error">
        Page not found
      </div>
      
      <div v-show="post" class="wrapper-content">
      	<app-logo></app-logo>
      	<div class="wrapper-forecast">
      	  <app-settings-checker></app-settings-checker>
      		<app-current-forecast></app-current-forecast>
    		  <app-hourly-ten-days-forecast-metric></app-hourly-ten-days-forecast-metric>
      	</div>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import VueJsonp from 'vue-jsonp'
  import VueResource from 'vue-resource'
  import store from '../store'
  import VueD3 from 'vue-d3'
  
  // Import custom components.
  import CurrentForecast from './../components/CurrentForecast.vue'
  import HourlyTenDaysForecastEnglish from './../components/HourlyTenDaysForecastEnglish.vue'
  import HourlyTenDaysForecastMetric from './../components/HourlyTenDaysForecastMetric.vue'
  import Logo from './../components/Logo.vue'
  import SettingsChecker from './../components/SettingsChecker.vue'
  
  Vue.use(VueD3)
  Vue.use(VueResource)
  Vue.use(VueJsonp)
  
  export default {
    name: 'forecast',
    store,
    start () {
      console.log(true)
    },
    data () {
      return {
        loading: true,
        post: false,
        error: false,
        data: '',
        units: {
          metric: false,
          english: false
        }
      }
    },
    created () {
      this.fetchData()
      this.fetchUnits()
    },
    watch: {
      '$route': 'fetchData',
      '$store.state.units': 'fetchUnits'
    },
    methods: {
      fetchUnits () {
        if (this.$store.state.units === 'english') {
          this.units.english = true
          this.units.metric = false
        } else if (this.$store.state.units === 'metric') {
          this.units.english = false
          this.units.metric = true
        }
      },
      fetchData () {
        var self = this
        this.$http.get('/#/area-of-forecast/' + this.$route.params.zmw).then((response) => {
          setTimeout(
            () => {
              self.post = true
              self.loading = false
            },
          1500)
        }, (response) => {
          this.error = true
        })
      }
    },
    components: {
      appCurrentForecast: CurrentForecast,
      appHourlyTenDaysForecastEnglish: HourlyTenDaysForecastEnglish,
      appHourlyTenDaysForecastMetric: HourlyTenDaysForecastMetric,
      appLogo: Logo,
      appSettingsChecker: SettingsChecker
    }
  }
</script>