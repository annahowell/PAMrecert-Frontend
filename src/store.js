import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:5000/api/v1/'
axios.defaults.withCredentials = false,
axios.defaults.headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    account: {
      isAuthenticated: false,
      isAdmin: false,
      userId: null,
      roleId: null,
    },
    loadingState: true,
    error: {
      state: false,
      message: null
    },
    perPageOptions: [
      { value: 1, text: '1' },
      { value: 2, text: '2' },
      { value: 5, text: '5' },
      { value: 10, text: '10' },
      { value: 25, text: '25' },
      { value: 50, text: '50' },
      { value: 100, text: '100' }
    ],
    servicePerPageChoice: 10,
    rolePerPageChoice: 10,
    userPerPageChoice: 10,
    tabCurrentlyOpen: 0,
    hideCertifiedOrEmpty: false,
    hideUnCertifiedOrEmpty: true,
    hideAssessed: false,
    allRecertCycles: [],
    currentRecertCycle: [],
    lastRecertCycle: [],
    myServices: [],
    myRoles: [],
    myUsers: [],
    allRoles: [],
    serviceRolePrivs: [],
    roleServicePrivs: [],
    riskAssessmentServicePrivs: [],
    previousRiskAssessmentServicePrivs: []
  },
  getters: {
    hideCertifiedOrEmpty: (state) => {
         return state.hideCertifiedOrEmpty;
     }
  },
  actions: { // can be async
    // =========================================================================
    // =========================     ACCOUNT STUFF     =========================
    // =========================================================================
    async getBaseData ({commit, dispatch}, {startLoading, endLoading}) {
      dispatch("getCurrentRecertCycle", {startLoading: startLoading, endLoading: false})
      .then(() => {
        if (this.state.currentRecertCycle.RecertCount !== 1) {
          dispatch("getLastRecertCycle", {startLoading: false, endLoading: false})
          .then(() => {
            if (this.state.currentRecertCycle.RecertEnabled) {
              dispatch("getRoleXroleOwnedServices", {roleId: this.state.account.roleId, startLoading: false, endLoading: false})
              .then(() => {
                dispatch("getAllRoles", {startLoading: false, endLoading: false})
                .then(() => {
                  dispatch("getUserXroleOwnerUsers", {userId: this.state.account.userId, startLoading: false, endLoading: false})
                  .then(() => {
                    dispatch("getRoleXroleOwnedRoles", {roleId: this.state.account.roleId, startLoading: false, endLoading: endLoading})
                  })
                })
              })
            } else {
              // We call getBaseData a few times when there are major state changes such as enabling or disabling
              // recert status, so we need to empty some values as well as get new ones depending on criteria
              commit('SET_ROLE_SERVICE_PRIVS', [])
              commit('SET_SERVICE_ROLE_PRIVS', [])
              commit('SET_MY_SERVICES', [])
              commit('SET_ALL_ROLES', [])
              commit('SET_MY_USERS', [])
              commit('SET_MY_ROLES', [])

              commit('SET_LOADING_STATE', {caller: 'getBaseData and !RecertEnabled', state: false})
            }
          })
        } else {
          commit('SET_LAST_RECERT_CYCLE', [])

          commit('SET_LOADING_STATE', {caller: 'getBaseData and currentRecertCycle.RecertCount === 1', state: false})
          return false
        }
      })
    },
    // =========================================================================
    // =========================     ACCOUNT STUFF     =========================
    // =========================================================================
    getAuthenticationStatus ({commit}) {
      // Placeholder authentication function, currently always returns static values.
      // Will be updated and expanded upon to enable single sign on via active
      // directory on REDACTED's servers if there's time during dissertation.
      // Currently not part of requirements spec and it makes more sense for
      // REDACTED's dotnet and vue devs to finish this off during integration.
      let authVar = true
      let adminVar = true
      //let userIdVar = 'hurne01'
      //let roleIdVar = 'cyberSecurityPlacement'
      let userIdVar = 'jacok01'
      let roleIdVar = 'riskDirector'

      console.info('Placeholder \'getAuthenticationStatus\' returning authentcated: ' + authVar + ' , admin:' + adminVar + ' , UserID: ' +  userIdVar + ' , RoleID: ' +  roleIdVar)

      commit('SET_ACCOUNT', {isAuthenticated: authVar, isAdmin: adminVar, userId: userIdVar, roleId: roleIdVar}) // remove this when implemented
    },
    // =========================================================================
    // =========================     RECERT CYCLE      =========================
    // =========================================================================
    async getAllRecertCycles ({commit}, {startLoading, endLoading}) {
      // Writing SET_LOADING_STATE with if's instead of ternary  because we don't wanna call SET_LOADING_STATE at all if false
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getAllRecertCycles', state: true})}

      return axios
        .get('recertcycle')
        .then(response => {
          commit('SET_ALL_RECERT_CYCLES', response.data)
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getAllRecertCycles', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getAllRecertCycles', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    async getCurrentRecertCycle ({commit}, {startLoading, endLoading}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getCurrentRecertCycle', state: true})}

      return axios
        .get('recertcycle/latestbut/0')
        .then(response => {
          commit('SET_CURRENT_RECERT_CYCLE', response.data)
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getCurrentRecertCycle', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getCurrentRecertCycle', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    async getLastRecertCycle ({commit}, {startLoading, endLoading}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getLastRecertCycle', state: true})}

      return axios
        .get('recertcycle/latestbut/1')
        .then(response => {
          commit('SET_LAST_RECERT_CYCLE', response.data)
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getLastRecertCycle', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getLastRecertCycle', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    async postNewRecertCycle ({commit, dispatch}, {vm, data,}) {
      commit('SET_LOADING_STATE', {caller: 'postNewRecertCycle', state: true})

      let postData = {
        RecertCycleTitle: data.formData.RecertCycleTitle,
        RecertStartedDate: data.formData.RecertStartedDate,
        RecertEnabled: data.formData.RecertEnabled
      }

      return axios
        .post('recertcycle', postData)
        .then(() => {
          dispatch("getBaseData", {startLoading: false, endLoading: false})
          .then(() => {
            vm.$bvToast.toast('A new recertification cycle has begun', {
              title: 'Success',
              solid: true,
              appendToast: true
            })
          })
        })
        .catch(error => {
          if (error.response.status === 400)
          {
            vm.$bvToast.toast(error.response.data, {
              title: 'Unable to begin new recertification cycle',
              solid: true,
              appendToast: true,
              variant: 'danger',
              autoHideDelay: 13000
            })
            console.error(error) // log the full error to console regardless
          } else {
            commit('SET_ERROR_STATE', {caller: 'postNewRecertCycle', state: true, data: error})
          }
        })
        .finally(() => commit('SET_LOADING_STATE', {caller: 'postNewRecertCycle', state: false}))
    },
    // -------------------------------------------------------------------------
    async patchRecertCycle ({commit, dispatch}, {vm, data}) {
      commit('SET_LOADING_STATE', {caller: 'patchRecertCycle', state: true})

      let patchData = []

      for (let element in data.formData) {
        let iteration = {
          'op': 'replace',
          'path': '/' + element,
          'value': data.formData[element]
        }
        patchData.push(iteration)
      }

      return axios
        .patch('recertcycle/' + data.RecertCycleId, patchData)
        .then(() => {
          dispatch('getBaseData', {startLoading: false, endLoading: false})

          vm.$bvToast.toast('Recertification cycle successfully updated', {
            title: 'Success',
            solid: true,
            appendToast: true
          })
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'patchRecertCycle', state: true, data: error})
        })
        .finally(() => commit('SET_LOADING_STATE', {caller: 'patchRecertCycle', state: false}))
    },
    // =========================================================================
    // ====================       SERVICE ROOT NODE        =====================
    // =========================================================================
    async getServiceXrolePrivs ({commit}, {serviceId, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getServiceXrolePrivs', state: true})}

      return axios
        .get('service/' + serviceId + '/roleprivs')
        .then(response => {
          commit('SET_SERVICE_ROLE_PRIVS', response.data)
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getServiceXrolePrivs', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getServiceXrolePrivs', state: false})}
        })
    },
    // =========================================================================
    // =========================        USERS          =========================
    // =========================================================================
    async getUserXroleOwnerUsers ({commit}, {userId, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getUserXroleOwnerUsers', state: true})}

      return axios
        .get('user/' + userId + '/ownedrolesusers')
        .then(response => {
          commit('SET_MY_USERS', response.data)
        })
        .catch(error => {
          if (error.response.status !== 404)
          {
            commit('SET_ERROR_STATE', {caller: 'getUserXroleOwnerUsers', state: true, data: error})
          }
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getUserXroleOwnerUsers', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    async patchUserX ({commit, dispatch}, {vm, data}) {
      commit('SET_LOADING_STATE', {caller: 'patchUserX', state: true})

      let patchData = []

      for (let element in data.formData) {
        let iteration = {
          'op': 'replace',
          'path': '/' + element,
          'value': data.formData[element]
        }
        patchData.push(iteration)
      }

      return axios
        .patch('user/' + data.userId, patchData)
        .then(() => {
          dispatch('getUserXroleOwnerUsers', {userId: this.state.account.userId, startLoading: false, endLoading: false})
          dispatch('getRoleXroleOwnedRoles', {roleId: this.state.account.roleId, startLoading: false, endLoading: false})

          vm.$bvToast.toast('User\'s role successfully updated', {
            title: 'Success',
            solid: true,
            appendToast: true
          })
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'patchUserX', state: true, data: error})
        })
        .finally(() => commit('SET_LOADING_STATE', {caller: 'patchUserX', state: false}))
    },
    // =========================================================================
    // ====================        ROLE ROOT NODE          =====================
    // =========================================================================
    async getAllRoles ({commit}, {startLoading, endLoading}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getAllRoles', state: true})}

      return axios
        .get('role')
        .then(response => {
          commit('SET_ALL_ROLES', response.data)
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getAllRoles', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getAllRoles', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    async getRoleXroleOwnedRoles ({commit}, {roleId, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleXroleOwnedRoles', state: true})}

      return axios
        .get('role/' + roleId + '/ownedroles')
        .then(response => {
          commit('SET_MY_ROLES', response.data)
        })
        .catch(error => {
          if (error.response.status !== 404)
          {
            commit('SET_ERROR_STATE', {caller: 'getRoleXroleOwnedRoles', state: true, data: error})
          }
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleXroleOwnedRoles', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    async getRoleXroleOwnedServices ({commit}, {roleId, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleXroleOwnedServices', state: true})}

      return axios
      .get('role/' + roleId + '/ownedservices')
        .then(response => {
          commit('SET_MY_SERVICES', response.data)
        })
        .catch(error => {
          if (error.response.status !== 404)
          {
            commit('SET_ERROR_STATE', {caller: 'getRoleXroleOwnedServices', state: true, data: error})
          }
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleXroleOwnedServices', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    async getRoleXservicePrivs ({commit}, {roleId, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleXservicePrivs', state: true})}

      axios
        .get('role/' + roleId + '/serviceprivs')
        .then(response => {
          commit('SET_ROLE_SERVICE_PRIVS', response.data)
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getRoleXservicePrivs', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleXservicePrivs', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    async patchRolePrivXbyRoleOwner ({commit, dispatch}, {vm, data}) {
      commit('SET_LOADING_STATE', {caller: 'patchRolePrivXbyRoleOwner', state: true})

      let patchData = []

      for (let element in data.formData) {
        let iteration = {
          'op': 'replace',
          'path': '/' + element,
          'value': data.formData[element]
        }
        patchData.push(iteration)
      }

      return axios
        .patch('role/priv/' + data.rolePrivId, patchData)
        .then(() => {
          dispatch('getRoleXroleOwnedRoles', {userId: this.state.account.roleId, startLoading: false, endLoading: false})
          dispatch('getRoleXservicePrivs', {roleId: data.roleId, startLoading: false, endLoading: false})

          vm.$bvToast.toast('Role owners privileges successfully updated', {
            title: 'Success',
            solid: true,
            appendToast: true
          })
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'patchRolePrivXbyRoleOwner', state: true, data: error})
        })
        .finally(() => commit('SET_LOADING_STATE', {caller: 'patchRolePrivXbyRoleOwner', state: false}))
    },
    // -------------------------------------------------------------------------
    async patchRolePrivXbyServiceOwner ({commit, dispatch}, {vm, data}) {
      commit('SET_LOADING_STATE', {caller: 'patchRolePrivXbyServiceOwner', state: true})

      let patchData = []

      for (let element in data.formData) {
        let iteration = {
          'op': 'replace',
          'path': '/' + element,
          'value': data.formData[element]
        }
        patchData.push(iteration)
      }

      return axios
        .patch('role/priv/' + data.rolePrivId, patchData)
        .then(() => {
          dispatch("getRoleXroleOwnedServices", {roleId: this.state.account.roleId, startLoading: false, endLoading: false})
          dispatch("getServiceXrolePrivs", {serviceId: data.serviceId, startLoading: false, endLoading: false})

          vm.$bvToast.toast('Service owners privileges successfully updated ()', {
            title: 'Success',
            solid: true,
            appendToast: true
          })
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'patchRolePrivXbyServiceOwner', state: true, data: error})
        })
        .finally(() => commit('SET_LOADING_STATE', {caller: 'patchRolePrivXbyServiceOwner', state: false}))
    },
    // =========================================================================
    // ===============        ADMIN (VARIOUS ROOT NODES)         ===============
    // =========================================================================
    async getRoleXriskAssessmentServicePrivsX ({commit}, {roleId, offset, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleXriskAssessmentServicePrivsX', state: true})}

      axios
        .get('role/' + roleId + '/riskassessmentserviceprivs/' + offset)
        .then(response => {
          if (offset === 0) {
            commit('SET_RISK_ASSESSMENT_SERVICE_PRIVS', response.data)
          } else if (offset === 1) {
            commit('SET_PREVIOUS_RISK_ASSESSMENT_SERVICE_PRIVS', response.data)
          }
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getRoleXriskAssessmentServicePrivsX', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleXriskAssessmentServicePrivsX', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    getCsv ({commit}, {vm, url, tableName, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getCsv', state: true})}

      axios
        .get(url, {responseType: 'blob'})
        .then(response => {
          if (response.status === 204) { // No rows found
            vm.$bvToast.toast('No data found in ' + tableName, {
              title: 'Download failed',
              solid: true,
              appendToast: true,
              variant: 'warning',
              autoHideDelay: 9000
            })
          } else {
            let fileURL = window.URL.createObjectURL(new Blob([response.data]));
            let fileLink = document.createElement('a');

            fileLink.href = fileURL;
            fileLink.setAttribute('download', tableName + '.csv');
            document.body.appendChild(fileLink);

            fileLink.click();
          }
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getCsv', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getCsv', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    getRoleCsvX ({commit}, {vm, baseDateTime, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleCsvX', state: true})}

      axios
        .get('role/csv?baseDateTime=' + baseDateTime, {responseType: 'blob'})
        .then(response => {
          if (response.status === 204) { // No rows found
            vm.$bvToast.toast('No role information found for selected cycle', {
              title: 'Download failed',
              solid: true,
              appendToast: true,
              variant: 'warning',
              autoHideDelay: 9000
            })
          } else {
            let fileURL = window.URL.createObjectURL(new Blob([response.data]));
            let fileLink = document.createElement('a');

            fileLink.href = fileURL;
            fileLink.setAttribute('download', 'All-Role-Recertification-Data.csv');
            document.body.appendChild(fileLink);

            fileLink.click();
          }
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getRoleCsvX', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleCsvX', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    getRoleDifferCsvX ({commit}, {vm, baseDateTime, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleDifferCsvX', state: true})}

      axios
        .get('role/differcsv?baseDateTime=' + baseDateTime, {responseType: 'blob'})
        .then(response => {
          if (response.status === 204) { // No rows found
            vm.$bvToast.toast('No differing roles found for selected cycle', {
              title: 'Download failed',
              solid: true,
              appendToast: true,
              variant: 'warning',
              autoHideDelay: 9000
            })
          } else {
            let fileURL = window.URL.createObjectURL(new Blob([response.data]));
            let fileLink = document.createElement('a');

            fileLink.href = fileURL;
            fileLink.setAttribute('download', 'Role-Recertification-Data-Differs.csv');
            document.body.appendChild(fileLink);

            fileLink.click();
          }
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getRoleDifferCsvX', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleDifferCsvX', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    getRoleDeltaCsvXx ({commit}, {vm, baseDateTime, deltaDateTime, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleDeltaCsvXx', state: true})}

      axios
        .get('role/deltacsv?baseDateTime=' + baseDateTime + '&deltaDateTime=' + deltaDateTime, {responseType: 'blob'})
        .then(response => {
          if (response.status === 204) { // No rows found
            vm.$bvToast.toast('No role delta found for selected cycles', {
              title: 'Download failed',
              solid: true,
              appendToast: true,
              variant: 'warning',
              autoHideDelay: 9000
            })
          } else {
            let fileURL = window.URL.createObjectURL(new Blob([response.data]));
            let fileLink = document.createElement('a');

            fileLink.href = fileURL;
            fileLink.setAttribute('download', 'Role-Recertification-Data-Delta.csv');
            document.body.appendChild(fileLink);

            fileLink.click();
          }
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getRoleDeltaCsvXx', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getRoleDeltaCsvXx', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    getUserDeltaCsvXx ({commit}, {vm, baseDateTime, deltaDateTime, startLoading = true, endLoading = true}) {
      if (startLoading) {commit('SET_LOADING_STATE', {caller: 'getUserDeltaCsvXx', state: true})}

      axios
        .get('user/deltacsv?baseDateTime=' + baseDateTime + '&deltaDateTime=' + deltaDateTime, {responseType: 'blob'})
        .then(response => {
          if (response.status === 204) { // No rows found
            vm.$bvToast.toast('No user delta found for selected cycles', {
              title: 'Download failed',
              solid: true,
              appendToast: true,
              variant: 'warning',
              autoHideDelay: 9000
            })
          } else {
            let fileURL = window.URL.createObjectURL(new Blob([response.data]));
            let fileLink = document.createElement('a');

            fileLink.href = fileURL;
            fileLink.setAttribute('download', 'User-Recertification-Data-Delta.csv');
            document.body.appendChild(fileLink);

            fileLink.click();
          }
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'getUserDeltaCsvXx', state: true, data: error})
        })
        .finally(() => {
          if (endLoading) {commit('SET_LOADING_STATE', {caller: 'getUserDeltaCsvXx', state: false})}
        })
    },
    // -------------------------------------------------------------------------
    async patchRoleServicePrivRiskAssessmentX ({commit, dispatch}, {vm, data}) {
      commit('SET_LOADING_STATE', {caller: 'patchRoleServicePrivRiskAssessmentX', state: true})

      let patchData = []

      for (let element in data.formData) {
        let iteration = {
          'op': 'replace',
          'path': '/' + element,
          'value': data.formData[element]
        }
        patchData.push(iteration)
      }

      return axios
        .patch('role/priv/' + data.rolePrivId, patchData)
        .then(() => {
          dispatch("getRoleXriskAssessmentServicePrivsX", {roleId: data.roleId, offset: 0, startLoading: false, endLoading: false})

          vm.$bvToast.toast('Risk successfully updated', {
            title: 'Success',
            solid: true,
            appendToast: true
          })
        })
        .catch(error => {
          commit('SET_ERROR_STATE', {caller: 'patchRoleServicePrivRiskAssessmentX', state: true, data: error})
        })
        .finally(() => commit('SET_LOADING_STATE', {caller: 'patchRoleServicePrivRiskAssessmentX', state: false}))
    },
    // -------------------------------------------------------------------------
    async postCsv ({commit}, {vm, url, formData}) {
      commit('SET_LOADING_STATE', {caller: 'postCsv', state: true})

      return axios
        .post(url, formData, {headers:{'Content-Type': 'multipart/form-data'}} )
        .then(() => {
          vm.$bvToast.toast('csv posted successfully ', {
            title: 'Success',
            solid: true,
            appendToast: true
          })
        })
        .catch(error => {
          if (error.response.status === 400)
          {
            vm.$bvToast.toast(error.response.data, {
              title: 'Invalid .csv',
              solid: true,
              appendToast: true,
              variant: 'danger',
              autoHideDelay: 13000
            })
            console.error(error) // log the full error to console regardless
          } else {
            commit('SET_ERROR_STATE', {caller: 'postCsv', state: true, data: error})
          }
        })
        .finally(() => commit('SET_LOADING_STATE', {caller: 'postCsv', state: false}))
    },
  },
  mutations: { // must be sync
    // =========================================================================
    // =========================  STATES AND CHOICES   =========================
    // =========================================================================
    SET_ACCOUNT (state, account) {
      state.account = account
    },
    SET_LOADING_STATE (state, loading) {
      // console.info(loading.caller + ' let loading state to: ' + loading.state)
      state.loadingState = loading.state
    },
    SET_ERROR_STATE (state, error) {
      console.error(error.caller + ' failed:')
      console.error('StatusCode: ' + error.data.response.status)
      console.error('StatusText: ' + error.data.response.statusText)

      if (typeof error.data.response.data === 'string')
      {
        console.error('Message: ' + error.data.response.data)
      }

      state.error = error
    },
    SET_TAB_CURRENTLY_OPEN (state, choice) {
      state.tabCurrentlyOpen = choice
    },
    SET_HIDE_CERTIFIED_OR_EMPTY (state, choice) {
      state.hideCertifiedOrEmpty = choice
    },
    SET_HIDE_UNCERTIFIED_OR_EMPTY (state, choice) {
      state.hideUnCertifiedOrEmpty = choice
    },
    SET_HIDE_ASSESSED (state, choice) {
      state.hideAssessed = choice
    },
    SET_SERVICE_PER_PAGE_CHOICE (state, choice) {
      state.servicePerPageChoice = choice
    },
    SET_ROLE_PER_PAGE_CHOICE (state, choice) {
      state.rolePerPageChoice = choice
    },
    SET_USER_PER_PAGE_CHOICE (state, choice) {
      state.userPerPageChoice = choice
    },
    // =========================================================================
    // =========================      RECERT DATA      =========================
    // =========================================================================
    SET_ALL_RECERT_CYCLES (state, allRecertCycles) {
      state.allRecertCycles = allRecertCycles
    },
    SET_CURRENT_RECERT_CYCLE (state, currentRecertCycle) {
      state.currentRecertCycle = currentRecertCycle
    },
    SET_LAST_RECERT_CYCLE (state, lastRecertCycle) {
      state.lastRecertCycle = lastRecertCycle
    },
    SET_SERVICE_ROLE_PRIVS (state, serviceRolePrivs) {
      state.serviceRolePrivs = serviceRolePrivs
    },
    SET_MY_SERVICES (state, myServices) {
      state.myServices = myServices
    },
    SET_ALL_ROLES (state, allRoles) {
      state.allRoles = allRoles
    },
    SET_MY_ROLES (state, myRoles) {
      state.myRoles = myRoles
    },
    SET_MY_USERS (state, myUsers) {
      state.myUsers = myUsers
    },
    SET_ROLE_SERVICE_PRIVS (state, roleServicePrivs) {
      state.roleServicePrivs = roleServicePrivs
    },
    SET_RISK_ASSESSMENT_SERVICE_PRIVS (state, riskAssessmentServicePrivs) {
      state.riskAssessmentServicePrivs = riskAssessmentServicePrivs
    },
    SET_PREVIOUS_RISK_ASSESSMENT_SERVICE_PRIVS (state, previousRiskAssessmentServicePrivs) {
      state.previousRiskAssessmentServicePrivs = previousRiskAssessmentServicePrivs
    }
  },
  modules: {
  }
})
