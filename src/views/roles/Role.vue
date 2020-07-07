<template>
  <div>
    <div v-if="!loadingState">

      <div v-if="this.$store.state.account.roleId == this.roleServicePrivs.RoleOwner_RoleId">

        <h2 class="font-weight-normal mt-5 mb-5">Recertify - {{this.roleServicePrivs.RoleName}}</h2>

        <p class="pb-3">Complete each form in the tabs below to complete recertification of the {{this.roleServicePrivs.RoleName}} role.</p>

        <b-form-checkbox
          class="text-right mb-1"
          id="hide-completed"
          v-model="hideCertifiedOrEmpty"
          name="hide-completed"
          >Hide Certified or Empty Roles</b-form-checkbox>

        <b-card no-body content-class="mt-3" :busy="loadingState">
          <b-tabs v-model="tabCurrentlyOpen" card>
            <b-tab v-for="roleServicePriv in filteredRoleServicePrivs" :key="roleServicePriv.RoleOwner_PrivId" :title="roleServicePriv.ServiceName">

              {{ /* ========================== Form ========================== */ }}

              <role-priv-form :roleId="roleId" :roleName="roleServicePrivs.RoleName" :roleServicePriv="roleServicePriv"/>
            </b-tab>

            <template v-slot:empty>
              <div v-if="hideCertifiedOrEmpty" class="text-muted">
                <p>Certification of all services assigned to this role has been completed, or there are no services assigned to the role.</p>
                <p>To view any completed services untick the '<i>Hide Certified or Empty Roles</i>' box above.</p>
              </div>
              <div v-else class="text-muted">
                There are no services assigned to this role.
                <div class="text-center">
                  <b-button variant="primary" href="#" :to="{name: 'roles'}" size="sm">Go to My Roles</b-button>
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

import RolePrivForm from '@/components/forms/RolePrivForm'

export default {
  props: ['roleId'],
  components: {
    RolePrivForm,
  },
  created () {
    this.$store.dispatch("getRoleXservicePrivs", {roleId: this.roleId, startLoading: true, endLoading: true})
  },
  computed: {
    filteredRoleServicePrivs: function() {
      if (this.roleServicePrivs.ServicePrivs !== undefined) {
        if (this.hideCertifiedOrEmpty) {
          return this.roleServicePrivs.ServicePrivs.filter(function(sp) {
            // filter out non-certified
            return !sp.RoleOwner_IsCertified
          })
        } else {
          // else filter nothing
          return this.roleServicePrivs.ServicePrivs
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
      'roleServicePrivs'
    ])
  },
  watch: {
    roleId () {
      this.$store.dispatch("getRoleXservicePrivs", {roleId: this.roleId, startLoading: true, endLoading: true})
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
