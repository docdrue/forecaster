<template>
  <div class="logo" v-on:click="clickedLogo">
    <img src="./../assets/logo.png">
  </div>
</template>

<script>
  export default {
    methods: {
      clickedLogo: function (name) {
        this.$router.push({ name: 'Index' })
      }
    }
  }
</script>