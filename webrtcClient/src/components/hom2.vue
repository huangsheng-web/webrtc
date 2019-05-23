<template>
  <div>
    <div is="phone" :myNo="phoneNo"></div>
  </div>
</template>
<script>
  import phone from './sPhone.vue';
  export default {
    components: {phone},
    data() {
      return {
        phoneNo: null
      }
    },
    created () {
      this.phoneNo = this.$route.query.no;
    },
    methods: {},
    watch: {}
  }
</script>
<style scoped="scoped">
</style>
