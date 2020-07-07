<template>
  <div>
    <div v-if="!loadingState">

      <h2 class="font-weight-normal mt-5 mb-5">Privileged Access Recertification</h2>

      <div class="pb-3" v-if="account.isAuthenticated && currentRecertCycle.RecertCount !== 1 && currentRecertCycle.RecertEnabled">
        <p v-if="this.myServices.length == 0 && this.myRoles.length == 0 && this.myUsers.length == 0">No recertification items found.</p>

        <p v-else>Select an item to being recertification.</p>
      </div>

      <b-card-group deck>

        {{ /* ====================== My Services ===================== */ }}

        <b-card v-if="this.myServices.length > 0" class="pb-2" header="" header-tag="header" title="My Services" bg-variant="light">
          <b-card-text class="pt-3">Recertify the privilege level of roles using services that you own.</b-card-text>

          <template v-slot:footer>
            <div class="text-right mt-4">
              <b-btn :to="{name: 'services'}" variant="primary">My Services</b-btn>
            </div>
          </template>
        </b-card>

        {{ /* ====================== My Roles ===================== */ }}

        <b-card v-if="this.myRoles.length > 0" class="pb-2" header="" header-tag="header" title="My Roles" bg-variant="light">
          <b-card-text class="pt-3">Recertify the privilege level of roles that you own.</b-card-text>

          <template v-slot:footer>
            <div class="text-right mt-4">
              <b-btn :to="{name: 'roles'}" variant="primary">My Roles</b-btn>
            </div>
          </template>
        </b-card>

        {{ /* ====================== My Users ===================== */ }}

        <b-card v-if="this.myUsers.length > 0" class="pb-2" header="" header-tag="header" title="My Users" bg-variant="light">
          <b-card-text class="pt-3">Change which role is allocated to users assigned to your roles.</b-card-text>

          <template v-slot:footer>
            <div class="text-right mt-4">
              <b-btn :to="{name: 'users'}" variant="primary">My Users</b-btn>
            </div>
          </template>
        </b-card>



      </b-card-group>
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

export default {
  computed: {
    ...mapState([
      'myServices',
      'myRoles',
      'myUsers',
      'loadingState',
      'currentRecertCycle',
      'account'
    ])
  },
}
</script>

<style scoped>
.card-title {
  text-transform: none!important;
}
.card-footer {
  padding-top:0!important;
  background-color: transparent!important;
  border-top: 1px solid transparent!important;
}
</style>
