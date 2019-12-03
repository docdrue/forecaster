<template>
  <div>
    <div class="geolocation-helper" v-if="geolocationHelperItemName">
      <div class="locator-icon">
        <div class='pin bounce'></div>
        <div class='pulse'></div>
      </div>
      <p>Is your current place <a v-on:click="clickedGeolocationHelperItem(geolocationHelperItemName)">{{ geolocationHelperItemName }}</a>?</p>
    </div>
    <div id="typeahead">
      <div class="wrapper-conten">
        <app-logo></app-logo>
        <app-geolocation-finder></app-geolocation-finder>
        <div class="logo-description">my weather board</div>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import VueJsonp from 'vue-jsonp'
  import store from '../store'

  // Import custom components.
  import GeolocationFinder from './../components/GeolocationFinder.vue'
  import Logo from './../components/Logo.vue'

  Vue.use(VueJsonp)

  export default {
    data () {
      return {
        zmwGeolookup: '',
        geolocationHelperItemName: false
      }
    },
    store,
    created () {
      this.geolookup()
    },
    methods: {
      geolookup: function () {
        /* global navigator */
        var thisDefault = this
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(function (position) {
            const urlGeolookup = `https://api.wunderground.com/api/2c381b3416dfbb9a/geolookup/q/${position.coords.latitude},${position.coords.longitude}.json`

            Vue.jsonp(urlGeolookup).then(json => {
              const cityName = json.location.city
              const countryName = json.location.country_name

              var place = `${cityName}, ${countryName}`
              var zmwStr = json.location.l
              var zmwGeolookup = zmwStr.replace(/[(/q/zmw:)]/g, '')
              thisDefault.zmwGeolookup = zmwGeolookup
              thisDefault.geolocationHelperItemName = place
            }, json => {})
          })
        } else {}
      },

      clickedGeolocationHelperItem: function (name) {
        this.$router.push({
          name: 'AreaOfForecast',
          params: {
            zmw: this.zmwGeolookup
          }
        })
      }
    },
    components: {
      appGeolocationFinder: GeolocationFinder,
      appLogo: Logo
    }
  }
</script>
