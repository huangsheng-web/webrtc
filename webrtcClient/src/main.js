import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'; // 2.0

Vue.use(Element)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
