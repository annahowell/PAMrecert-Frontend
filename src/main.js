// Import basics
import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'

// Import moment for datetime handling
import moment from 'moment';

// Import Scrollto
import VueScrollTo from 'vue-scrollto'

// Import Bootstrap
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Import Fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowUp, faArrowDown, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faArrowUp, faArrowDown, faInfoCircle)
Vue.component('fa-icon', FontAwesomeIcon)

Vue.use(BootstrapVue, {
  'BToast': {
    'toaster': 'b-toaster-bottom-right',
    'autoHideDelay': 2500,
    'variant': 'success'
  }
})

Vue.use(VueScrollTo)

Vue.config.productionTip = false



Vue.prototype.$currentDate = function() {
  return moment().format('YYYY-MM-DD')
}

Vue.prototype.$currentTime = function() {
  return moment().format('HH:mm:ss')
}

Vue.prototype.$currentDateTime = function() {
  return moment().format('YYYY-MM-DD HH:mm:ss')
}

Vue.prototype.$computeDate = function(datetime) {
  return moment(datetime).format('YYYY-MM-DD')
}

Vue.prototype.$friendlyDateTime = function(datetime) {
  return moment(datetime).format('Do MMM Y') + ' at ' + moment(datetime).format('h:mm a')
}

Vue.prototype.$datetimeIsAfter = function(datetimeBase, datetimeVariable) {
  return moment(datetimeBase).isBefore(datetimeVariable)
}

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
