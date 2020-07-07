<template>
  <div id="app">
    <b-navbar toggleable="md" type="faded" variant="light" class="p-1 px-md-3 mb-3">
      <b-navbar-brand :to="{name: 'home'}" class="mr-md-auto text-hide mt-1" style="background: url('/img/logo.svg') center center / cover no-repeat;height:42px;width:180px;">Your brand here</b-navbar-brand>
        <b-navbar-nav class="pt-2 pb-2">
          <div v-if="account.isAuthenticated && (currentRecertCycle.RecertCount !== 1 && currentRecertCycle.RecertEnabled || account.isAdmin)">

            <b-button variant="primary" :to="{name: 'home'}" size="sm">Home</b-button>

            <b-dropdown
              split
              right
              text="My Services"
              variant="primary"
              size="sm"
              :split-to="{name: 'services'}"
              class="ml-3"
              v-if="this.myServices.length > 0">
              <b-dropdown-item
                size="sm"
                class="fs-90"
                active-class="active"
                v-for="service in myServices"
                :key="service.ServiceId"
                :to="{name: 'service', params: { serviceId: service.ServiceId }}">
                {{service.ServiceName}}
              </b-dropdown-item>
            </b-dropdown>

            <b-dropdown
              split
              right
              text="My Roles"
              variant="primary"
              size="sm"
              :split-to="{name: 'roles'}"
              class="ml-3"
              v-if="this.myRoles.length > 0">
              <b-dropdown-item
                size="sm"
                class="fs-90"
                active-class="active"
                v-for="role in myRoles"
                :key="role.RoleId"
                :to="{name: 'role', params: { roleId: role.RoleId }}">
                {{role.RoleName}}
              </b-dropdown-item>
            </b-dropdown>

            <b-button v-if="this.myUsers.length > 0" variant="primary" class="ml-3" href="#" :to="{name: 'users'}" size="sm">My Users</b-button>

            <b-dropdown
              v-if="account.isAdmin"
              split
              right
              text="Admin"
              variant="primary"
              class="ml-3"
              size="sm"
              href="#"
              :split-to="{name: 'admin'}">
              <b-dropdown-item v-if="currentRecertCycle.RecertCount !== 1" size="sm" class="fs-90" active-class="active" :to="{name: 'admin-risk-assessment'}">Risk Assessment</b-dropdown-item>
              <b-dropdown-item v-if="currentRecertCycle.RecertCount !== 1" size="sm" class="fs-90" active-class="active" :to="{name: 'admin-generate-reports'}">Generate Reports</b-dropdown-item>
              <b-dropdown-item size="sm" class="fs-90" active-class="active" :to="{name: 'admin-download-upload'}">Upload / Download CSV Files</b-dropdown-item>
            </b-dropdown>

            <b-button variant="outline-primary" class="ml-5" :to="{name: 'account-logout'}" size="sm">Sign Out</b-button>
          </div>

        <b-button v-else-if="!account.isAuthenticated" variant="primary" class="ml-5" :to="{name: 'account-login'}" size="sm">Sign In</b-button>
      </b-navbar-nav>
    </b-navbar>

    <b-container class="mt-4 mb-5 pb-5" style="max-width:1140px!important">
      <div v-if="error.state">
        <h2 class="font-weight-normal mt-5 mb-5">An error has occurred</h2>

        <p>Please contact your system administrator and cite the circumstances under which the error occured, along with the following diagnostic error message:</p>

        <p>{{error.data}}</p>
      </div>

      <div v-else-if="!account.isAdmin && (!currentRecertCycle.RecertEnabled || currentRecertCycle.RecertCount === 1)">
        <h2 class="font-weight-normal mt-5 mb-5">Recertifications disabled</h2>

        <p>All privileged access recertification actions are disabled at present, please try again later.</p>
      </div>
      <div v-else>
        <b-alert v-if="!this.loadingState && this.$route.name !== 'admin' && (!currentRecertCycle.RecertEnabled || currentRecertCycle.RecertCount === 1) && this.$route.name !== 'admin-download-upload'" variant="warning" show>
          <p>Recertification cycle disabled or the only found recertification cycle is the initial (automatically generated) cycle.</p>

          <p class="mb-0">Visibility of service, role and user data  is currently <b>disabled</b>. Please visit the <b-link :to="{name: 'admin'}">admin page</b-link> and follow the instructions.</p>
        </b-alert>

        <router-view/>

      </div>
    </b-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  created () {
    this.$store.dispatch("getBaseData", {})
  },
  computed: {
    ...mapState([
      'account',
      'error',
      'currentRecertCycle',
      'lastRecertCycle',
      'myServices',
      'myRoles',
      'myUsers',
      'loadingState'
    ])
  }
}
</script>

<style>
#rbac-spinner-container {
  position: fixed;
  width: 100%;
  height:100%;
  display: flex;
  top: 0;
  left: 0;
  opacity: 0.55;
}

#rbac-spinner-inner {
  margin: auto;
}

.modal-footer {
  border-top: 1px solid transparent!important;
}

.separator {
  display: flex!important;
  align-items: center!important;
  text-align: center!important;
  color: rgba(0, 0, 0, 0.65)!important;
}

.separator::before, .separator::after {
  content: ''!important;
  flex: 1!important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15)!important;
}

.separator::before {
  margin-right: .5em!important;
}

.separator::after {
  margin-left: .5em!important;
}

.top-separator {
  border-top: 1px solid rgba(0, 0, 0, 0.15)!important
}

.dropdown-item.active, .dropdown-item:active {
  background-color: #e9ecef!important;
  color: #212529!important;
}

.fs-85 {
  font-size: 85%!important;
  colo1r: red!important;
}

.fs-90,
textarea {
  font-size: 90%!important;
}

.mh-90 {
  min-height: 90px!important;
}

.table th,
.input-group-text {
  font-size: 95%!important;
}

.table td {
  padding: 1rem 0.5rem!important;
}

h1, h2, h3, h4, h5, h6 {
  text-transform: capitalize!important;
}

/* Style our pre for debugging output @TODO prune*/
pre  {
  white-space: pre-line;
  word-wrap: break-word;
  font-family: inherit;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
