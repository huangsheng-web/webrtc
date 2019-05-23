<template>
  <div>
    <div class="person" v-for="item in callList" :key="item.id">
      <el-button @click="beginCall(item)" type="primary">呼叫{{item}}</el-button>
    </div>
    <!--<div :class="'move_box' + index" v-for="(item, index) in curCall" :key="item.id">-->
      <!--<div is="pc" :targetId="item" :myNo="phoneNo"></div>-->
    <!--</div>-->
    <div is="pc" :addCall="curCall" :myNo="phoneNo"></div>
  </div>
</template>
<script>
  import pc from './sPc.vue';
  export default {
    components: {pc},
    data() {
      return {
        phoneNo: null,
        maxConnect: 5,
        curCall: {},
        callList: ['111','222','333','444','555','666']
      }
    },
    created () {
      this.phoneNo = this.$route.query.no;
    },
    watch: {
      maxConnect () {
        console.log('变了')
      }
    },
    methods: {
      beginCall (key) {
        this.curCall = {
          remoteId: key,
          type: 1
        }
      }
    }
  }
</script>
<style scoped="scoped">
  .person{
    display: inline-block;
    cursor: pointer;
    margin-right: 20px;
  }
  .move_box0 {
    position: fixed;
    top: 110px;
    left: 20px;
  }
  .move_box1 {
    position: fixed;
    top: 110px;
    left: 290px;
  }
  .move_box2 {
    position: fixed;
    top: 110px;
    left: 560px;
  }
  .move_box3 {
    position: fixed;
    bottom: 20px;
    left: 20px;
  }
  .move_box4 {
    position: fixed;
    bottom: 20px;
    left: 290px;
  }
  .move_box5 {
    position: fixed;
    bottom: 20px;
    left: 560px;
  }
</style>
