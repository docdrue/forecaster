<template>
  <div class="geolocation-finder">
    <input 
      autocomplete="off"
      type="text" 
      v-model="selection"
      placeholder="Search locations"
      @input = 'getData'
      @keydown.down="setActiveTownDown"
      @keydown.up="setActiveTownUp"
      @keydown.enter="activeTownHit"
    />
    <div class="wrapper-load-spinner" v-if="typeaheadLoadSpinner">
      <svg class="load-spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
    </div>
    <div class="close-box" v-if="typeaheadCloseBox" v-on:click="typeaheadCloseBoxClicked()"></div>
    <ul class="typeahead-dropdown-menu">
      <li
        v-for="(item, index) in items"
        v-bind:index="index"
        :class="{active: item.active}"
        v-on:mouseover="setActiveTown(item)"
      >
        <a v-on:click="clickedItem(item)">{{ item.name }}</a>
      </li>
  </ul>
  </div>
</template>

<script>
  import Vue from 'vue'
  import VueJsonp from 'vue-jsonp'
  import store from '../store'
  
  Vue.use(VueJsonp)
  
  const autocompleteUrl = 'https://autocomplete.wunderground.com/aq'
  
  var findActiveTown = (thisDefault, current) => {
    thisDefault.items.forEach(item => {
      Vue.set(item, 'active', false)
      if (item.index === current) {
        Vue.set(item, 'active', true)
        thisDefault.selection = item.name
      }
    })
  }
  var hitEvent = (thisDefault, item) => {
    thisDefault.$router.push({ name: 'AreaOfForecast', params: { zmw: item.zmw }})
    thisDefault.$store.commit('currentCityNameChanger', item.name)
  }

  export default Vue.extend({
    data () {
      return {
        selection: '',
        items: '',
        active: false,
        current: -1,
        typeaheadLoadSpinner: false,
        typeaheadCloseBox: false
      }
    },
    store,
    watch: {
      'selection': 'selectionChecker'
    },
    methods: {
      selectionChecker: function () {
        if (this.selection === 0) this.typeaheadCloseBox = false
      },
      typeaheadCloseBoxClicked: function () {
        this.typeaheadCloseBox = false
        this.selection = ''
        this.items = ''
      },
      getData: function () {
        if (this.selection.length > 0) this.typeaheadCloseBox = true
        if (this.selection.length > 2) {
          this.typeaheadLoadSpinner = true
          this.typeaheadCloseBox = false
          this.$jsonp(autocompleteUrl, { query: this.selection, callbackQuery: 'cb' }).then(json => {
            if (this.selection === '') {
              this.items = ''
            } else {
              this.items = json.RESULTS.slice(0, 5)
            }
            let index = 0
            this.items.forEach(item => {
              Vue.set(item, 'active', false)
              Vue.set(item, 'index', index++)
            })

            this.typeaheadLoadSpinner = false
            this.typeaheadCloseBox = true
          }, json => {})

          this.current = -1
        } else {
          this.items = ''
          this.typeaheadLoadSpinner = false
        }
      },
      setActiveTown: function (item) {
        //  Rremove active from towns
        this.items.forEach(item => {
          Vue.set(item, 'active', false)
        })
        //  Set active town
        Vue.set(item, 'active', true)
        //  Set current town for input placeholder
        this.selection = item.name
        this.current = item.index
      },
      setActiveTownUp: function () {
        if (this.current > 0) {
          var current = --this.current
          var thisDefault = this
          findActiveTown(thisDefault, current)
        }
      },
      setActiveTownDown: function () {
        if (this.current < this.items.length - 1) {
          var current = ++this.current
          var thisDefault = this
          findActiveTown(thisDefault, current)
        }
      },
      activeTownHit: function () {
        var thisDefault = this
        this.items.forEach(item => {
          if (item.active === true) {
            hitEvent(thisDefault, item)
          }
        })
      },
      clickedItem: function (item) {
        var thisDefault = this
        hitEvent(thisDefault, item)
      }
    }
    // components: {
    //   'auto-complete': autoComplete
    // }
  })
</script>