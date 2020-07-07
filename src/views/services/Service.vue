<template>
  <div>
    <div v-if="!loadingState">

      <div v-if="this.$store.state.account.roleId == this.serviceRolePrivs.ServiceOwner_RoleId">

        <h2 class="font-weight-normal mt-5 mb-5">Recertify - {{this.serviceRolePrivs.ServiceName}}</h2>

        <p class="pb-3">Complete each form in the tabs below, to complete recertification of the {{this.serviceRolePrivs.ServiceName}} service.</p>

        <b-form-checkbox
          class="text-right mb-1"
          id="hide-completed"
          v-model="hideCertifiedOrEmpty"
          name="hide-completed"
          >Hide Certified or Empty Services</b-form-checkbox>

        <b-card no-body content-class="mt-3" :busy="loadingState">
          <b-tabs v-model="tabCurrentlyOpen" card>
            <b-tab v-for="serviceRolePriv in filteredServiceRolePrivs" :key="serviceRolePriv.RoleServiceOwner_PrivId" :title="serviceRolePriv.RoleName">

              {{ /* ========================== Form ========================== */ }}

              <service-priv-form :servicesAvailablePrivs="serviceRolePrivs.ServicesAvailablePrivs" :serviceId="serviceId" :serviceName="serviceRolePrivs.ServiceName" :serviceRolePriv="serviceRolePriv"/>
            </b-tab>

            <template v-slot:empty>
              <div v-if="hideCertifiedOrEmpty" class="text-muted">
                <p>Certification of all roles using this service has been completed, or there are no roles using the service.</p>
                <p>To view any completed roles untick the '<i>Hide Certified or Empty Services</i>' box above.</p>
              </div>
              <div v-else class="text-muted">
                There are no roles assigned to this service.
                <div class="text-center">
                  <b-button variant="primary" href="#" :to="{name: 'services'}" size="sm">Go to My Services</b-button>
                </div>
              </div>
            </template>
          </b-tabs>
        </b-card>
      </div>
      <div v-else>
        {{ this.$router.push({ name: 'four-zero-three' }) }}
      </div>
    </div>

    <div v-else>
      <div id="rbac-spinner-container">
        <div id="rbac-spinner-inner">
          <b-spinner small></b-spinner>
          <strong class="ml-2">Loading...</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import ServicePrivForm from '@/components/forms/ServicePrivForm'

export default {
  props: ['serviceId'],
  components: {
    ServicePrivForm,
  },
  created () {
    this.$store.dispatch("getServiceXrolePrivs", {serviceId: this.serviceId, startLoading: true, endLoading: true})
  },
  computed: {
    filteredServiceRolePrivs: function() {
      if (this.serviceRolePrivs.RolePrivs !== undefined) {
        if (this.hideCertifiedOrEmpty) {
          return this.serviceRolePrivs.RolePrivs.filter(function(sp) {
            // filter out non-certified
            return !sp.ServiceOwner_IsCertified
          })
        } else {
          // else filter nothing
          return this.serviceRolePrivs.RolePrivs
        }
      } else {
        return []
      }
    },
    tabCurrentlyOpen: {
      // State can save choices despite page changes
      get () { return this.$store.state.tabCurrentlyOpen },
      set (value) { this.$store.commit('SET_TAB_CURRENTLY_OPEN', value) }
    },
    hideCertifiedOrEmpty: {
      // State can save choices despite page changes
      get () { return this.$store.state.hideCertifiedOrEmpty },
      set (value) { this.$store.commit('SET_HIDE_CERTIFIED_OR_EMPTY', value) }
    },
    ...mapState([
      'currentRecertCycle',
      'lastRecertCycle',
      'loadingState',
      'serviceRolePrivs'
    ])
  },
  watch: {
    serviceId () {
      this.$store.dispatch("getServiceXrolePrivs", {serviceId: this.serviceId, startLoading: true, endLoading: true})
    }
  }
}
</script>

<style scoped>
.tab-pane.active.card-body,
.nav-link.active {
  background-color: #F2F2F2!important;
}

.nav-link.active,
.nav-link.active:hover {
  border: 1px solid #CCCFD1!important;
  border-bottom: 1px solid #E9ECEF!important;
}

.nav-link:hover {
  background-color: #EBEEF0;
  border: 1px solid #CCCFD1!important;
}

.card-header {
  background-color: #E9ECEF!important;
}
</style>
