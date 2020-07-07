<template>
  <div>
    <div v-if="!loadingState">

      <h2 class="font-weight-normal mt-5 mb-5">Admin - Risk Assess - {{title}}</h2>

      <p class="pb-3">Complete each form on the tabs below to complete a risk assessment of the {{this.riskAssessmentServicePrivs.RoleName}} role.</p>

      <b-form-checkbox
        class="text-right mb-1"
        id="hide-completed"
        v-model="hideAssessed"
        name="hide-completed"
      >Hide Completed</b-form-checkbox>

      <b-card no-body content-class="mt-3" :busy="loadingState">
        <b-tabs v-model="tabCurrentlyOpen" card>
          <b-tab v-for="riskAssessmentServicePriv in filteredRiskAssessmentServicePrivs" :key="riskAssessmentServicePriv.RolePrivId" :title="riskAssessmentServicePriv.RoleOwner_ServiceName">

            {{ /* ========================== Form ========================== */ }}

            <risk-assessment-form
              :roleId="roleId"
              :roleName="riskAssessmentServicePrivs.RoleName"
              :riskAssessmentServicePriv="riskAssessmentServicePriv"
              :previousRiskAssessmentServicePriv="previousRiskAssessmentServicePrivs.RiskAssessment.filter(item => item.RolePrivId === riskAssessmentServicePriv.RolePrivId)[0]"
            />
          </b-tab>

          <template v-slot:empty>
            <div v-if="hideAssessed" class="text-muted">
              <p>Certification of all services has been completed, or there are no services assigned to this role.</p>
              <p>To view your completed services untick the 'Hide Completed' box above.</p>
            </div>
            <div v-else class="text-muted">
              <p>There are no services assigned to this role.</p>
              <div class="text-center">
                <b-button variant="primary" href="#" :to="{name: 'admin-risk-assessment'}" size="sm">Go to Risk Assessment</b-button>
              </div>
            </div>
          </template>
        </b-tabs>
      </b-card>
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

import RiskAssessmentForm from '@/components/forms/RiskAssessmentForm'

export default {
  props: ['roleId'],
  components: {
    RiskAssessmentForm,
  },
  data () {
    return {
      title: ''
    }
  },
  created () {
    this.$store.dispatch("getRoleXriskAssessmentServicePrivsX", {roleId: this.roleId, offset: 0, startLoading: true, endLoading: false})
    this.$store.dispatch("getRoleXriskAssessmentServicePrivsX", {roleId: this.roleId, offset: 1, startLoading: false, endLoading: true})
  },
  computed: {
    filteredRiskAssessmentServicePrivs: function() {
      if (this.riskAssessmentServicePrivs !== undefined) {
        if (this.hideAssessed) {
          return this.riskAssessmentServicePrivs.RiskAssessment.filter(function(sp) {
            // filter out non-certified
            return !sp.RiskIsAssessed
          })
        } else {
          // else filter nothing
          return this.riskAssessmentServicePrivs.RiskAssessment
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
    hideAssessed: {
      // State can save choices despite page changes
      get () { return this.$store.state.hideAssessed },
      set (value) { this.$store.commit('SET_HIDE_ASSESSED', value) }
    },
    ...mapState([
      'currentRecertCycle',
      'lastRecertCycle',
      'loadingState',
      'riskAssessmentServicePrivs',
      'previousRiskAssessmentServicePrivs'
    ])
  },
  watch: {
    roleId () {
      this.$store.dispatch("getRoleXriskAssessmentServicePrivsX", {roleId: this.roleId, offset: 0, startLoading: true, endLoading: false})
      this.$store.dispatch("getRoleXriskAssessmentServicePrivsX", {roleId: this.roleId, offset: 1, startLoading: false, endLoading: true})
    },
    riskAssessmentServicePrivs () {
      this.title = this.riskAssessmentServicePrivs.RoleName
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
