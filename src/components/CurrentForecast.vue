<template>
    <div>
      <div class='current-city-name'>{{ currentCityName }}</div>
  		<div class='current-date'>{{ currentTime }}</div>
  		<div class='columns'>
    		<div class='current-weather'>
    			<div class='current-weather-title'>Current weather</div>
    			<div class='temperature'>{{ currentTemp }}</div>
    			<div class='humidity'>
    				<div class='title'>Humidity</div>
    				<div class='value'>{{ currentForecast.relative_humidity }}</div>
    			</div>
    			<div class='feels-like'>
    				<div class='title'>Feels like</div>
    				<div class='value'>{{ currentFeelsLike }}</div>
    			</div>
    			<div class='wind-chill'>
    				<div class='title'>Wind chill</div>
    				<div class='value'>{{ currentWindChill }}</div>
    			</div>
    			<div class='weather-icon'>
    				<div class='icon' :class='currentForecast.icon'></div>
    				<div class='description'>
    					<div class='title'>{{ currentForecast.weather }}</div>
    					<div class='visibility'>{{ currentVisibility }}</div>
    				</div>
    			</div>
    			<div class='sun'>
    				<div class='sunrise'>
    					<div class='icon'></div>
    					<div class='title'>Sunrise: </div>
    					<div class='value'>{{ currentSunrise }}</div>
    				</div>
    				<div class='sunset'>
    					<div class='icon'></div>
    					<div class='title'>Sunset: </div>
    					<div class='value'>{{ currentSunset }}</div>
    				</div>
    			</div>
    		</div>
    		<div class='wind-speed-wrapper'>
    			<div class='current-speed-title'>Wind speed</div>
    			<div class='rose-of-wind'>
    				<div class='areas-wrapper'>
    					<div class='area n'>N</div>
    					<div class='area e'>E</div>
    					<div class='area s'>S</div>
    					<div class='area w'>W</div>
    				</div>
    				<div class='wind-circle'>
    					<svg width='226px' height='226px' viewBox='0 0 225 225'>
							 <g>
							  <path class='circle' d='M112 7c59,0 106,47 106,106 0,58 -47,105 -106,105 -58,0 -105,-47 -105,-105 0,-59 47,-106 105,-106zm0 -7c63,0 113,50 113,113 0,62 -50,112 -113,112 -62,0 -112,-50 -112,-112 0,-63 50,-113 112,-113z'/>
							 </g>
							</svg>
    				</div>
    				<div class='wind-arrow' v-show='currentWindSpeedBoolean'>
    					<svg :style='{transform:`rotate(${ currentForecast.wind_degrees }deg)`}' width='270px' height='270px' viewBox='0 0 270 270'>
							 <g>
							  <path class='arrow' d='M121 243l14 25 14 -25 -28 0zm26 -218l0 -23 -12 9 -12 -9 0 24 24 -1z'/>
							 </g>
							</svg>
    				</div>
    				<div class='params'>
    					<div class='label'>Good surf</div>
    					<div class='wind-speed'>{{ currentWindSpeed }}</div>
    					<div class='metric'>{{ currentWindSpeedMetric }}</div>
    				</div>
    			</div>
    		</div>
    	</div>
    </div>
</template>

<script>
  import Vue from 'vue'
  import VueJsonp from 'vue-jsonp'
  
  Vue.use(VueJsonp)
  
  var correctTemp = (value) => {
    const patt = /-/
    return patt.test(value)
  }

  var currentForecastUnitsFetcher = self => {
    var date = new Date(self.currentForecast.local_time_rfc822)
    var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    self.currentWindSpeedBoolean = true

    if (self.$store.state.units === 'english') {
      self.currentTime = `${date.getDate()}th of ${month[date.getMonth()]} | ${weekday[date.getDay()]} | ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
      self.currentTemp = self.currentForecast.temp_f + ' °F'
      self.currentFeelsLike = `${self.currentForecast.feelslike_f} °F`
      self.currentWindChill = `${self.currentForecast.windchill_f} °F`
      if (self.currentForecast.visibility_mi === 'N/A') {
        self.currentVisibility = `Clear Visibility`
      } else {
        self.currentVisibility = `Visibility ${self.currentForecast.visibility_mi} miles`
      }
      self.currentWindSpeed = self.currentForecast.wind_mph
      if (self.currentWindSpeed === 0) self.currentWindSpeedBoolean = false
      self.currentWindSpeedMetric = 'miles per hour'
      var sunriseDate = new Date(`Tue Jan 17 2017 ${self.currentSunriseHour}:${self.currentSunriseMinute}:00 GMT+0200 (FLE Standard Time)`)
      var sunsetDate = new Date(`Tue Jan 17 2017 ${self.currentSunsetHour}:${self.currentSunsetMinute}:00 GMT+0200 (FLE Standard Time)`)
      self.currentSunrise = sunriseDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
      self.currentSunset = sunsetDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    } else if (self.$store.state.units === 'metric') {
      self.currentTime = `${date.getDate()}th of ${month[date.getMonth()]} | ${weekday[date.getDay()]} | ${date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`
      self.currentTemp = self.currentForecast.temp_c + ' °C'
      self.currentFeelsLike = `${self.currentForecast.feelslike_c} °C`
      self.currentWindChill = `${self.currentForecast.windchill_c} °C`
      self.currentVisibility = `Visibility ${self.currentForecast.visibility_km} kilometers`
      self.currentWindSpeed = self.currentForecast.wind_kph
      if (self.currentWindSpeed === '0.0') self.currentWindSpeedBoolean = false
      self.currentWindSpeedMetric = 'meters per second'
      self.currentSunrise = `${self.currentSunriseHour}:${self.currentSunriseMinute}`
      self.currentSunset = `${self.currentSunsetHour}:${self.currentSunsetMinute}`
    }

    if (correctTemp(self.currentTemp) === false && self.currentTemp !== 0) self.currentTemp = '+' + self.currentTemp
    if (correctTemp(self.currentFeelsLike) === false && self.currentFeelsLike !== 0) self.currentFeelsLike = '+' + self.currentFeelsLike
    if (correctTemp(self.currentWindChill) === false && self.currentWindChill !== 0) self.currentWindChill = '+' + self.currentWindChill
  }
  
  export default Vue.extend({
    data () {
      return {
        currentForecast: '',
        currentTime: '',
        currentTemp: '',
        currentFeelsLike: '',
        currentWindChill: '',
        currentVisibility: '',
        currentWindSpeed: '',
        currentWindSpeedMetric: '',
        currentWindSpeedBoolean: '',
        currentSunriseHour: '',
        currentSunriseMinute: '',
        currentSunsetHour: '',
        currentSunsetMinute: '',
        currentSunrise: '',
        currentSunset: '',
        currentCityName: ''
      }
    },
    created () {
      this.fetchCurrentForecast()
      this.fetchCurrentForecastUnits()
    },
    watch: {
      '$route': 'fetchCurrentForecast',
      '$store.state.units': 'fetchCurrentForecastUnits'
    },
    methods: {
      fetchCurrentForecast () {
        var self = this
        //  Get current forecast
        Vue.jsonp(`https://api.wunderground.com/api/2c381b3416dfbb9a/conditions/astronomy/q/zmw:${this.$route.params.zmw}.json`).then(json => {
          self.$store.commit('currentLocationChanger', {
            latitude: json.current_observation.observation_location.latitude,
            longitude: json.current_observation.observation_location.longitude
          })
          self.currentForecast = json.current_observation
          self.currentCityName = self.currentForecast.display_location.full
          self.currentForecast.wind_kph = (self.currentForecast.wind_kph * 1000) / 3600
          self.currentForecast.wind_kph = self.currentForecast.wind_kph.toFixed(1)
          self.currentSunriseHour = json.sun_phase.sunrise.hour
          self.currentSunriseMinute = json.sun_phase.sunrise.minute
          self.currentSunsetHour = json.sun_phase.sunset.hour
          self.currentSunsetMinute = json.sun_phase.sunset.minute
          currentForecastUnitsFetcher(self)
        }, json => {
          // Failed.
          self.$router.push({ name: 'ErrorPage' })
        })
      },
      fetchCurrentForecastUnits () {
        var self = this
        currentForecastUnitsFetcher(self)
      }
    }
  })
</script>