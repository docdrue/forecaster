<template>
  <div class="settings-checker">
    <div class="button" title="Settings" v-on:click=toggleSettings :class="{ active: isActiveSettings }"></div>
    <div class="settings" v-show="isActiveSettings">
      <div class="units">
        <div class="title">Units:</div>
        <ul>
          <li><a v-on:click=toEnglishUnits title="Switch to English" :class="{ active: isActiveUnitEnglish }">English</a></li>
          <li><a v-on:click=toMetrichUnits title="Switch to Metric" :class="{ active: isActiveUnitMetric }">Metric</a></a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import store from '../store'
  import Cookies from './../services/Cookies.js'
  
  const cookies = new Cookies()
  
  export default {
    store,
    data () {
      return {
        isActiveSettings: false,
        isActiveUnitEnglish: true,
        isActiveUnitMetric: false
      }
    },
    created () {
      this.fetchCurrentSettings()
    },
    methods: {
      fetchCurrentSettings () {
        if (cookies.getCookie('units') === 'english') {
          this.isActiveUnitEnglish = true
          this.isActiveUnitMetric = false
        } else if (cookies.getCookie('units') === 'metric') {
          this.isActiveUnitEnglish = false
          this.isActiveUnitMetric = true
        }
      },
      toggleSettings () {
        this.isActiveSettings ^= true
      },
      toEnglishUnits () {
        this.$store.commit('unitsChanger', 'english')
        this.isActiveUnitEnglish = true
        this.isActiveUnitMetric = false
      },
      toMetrichUnits () {
        this.$store.commit('unitsChanger', 'metric')
        this.isActiveUnitEnglish = false
        this.isActiveUnitMetric = true
      }
    }
  }
</script>