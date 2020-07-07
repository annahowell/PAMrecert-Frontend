import Vue from 'vue'
import Router from 'vue-router'

import AccountLoginView from './views/account/Login.vue'
import AccountLogoutView from './views/account/Logout.vue'

import HomeView from './views/Home.vue'

import ServicesView from './views/services/Services.vue'
import ServiceView from './views/services/Service.vue'

import RolesView from './views/roles/Roles.vue'
import RoleView from './views/roles/Role.vue'

import UsersView from './views/users/Users.vue'

import AdminView from './views/admin/Admin.vue'
import AdminRiskAssessmentRolesView from './views/admin/riskassessment/RiskRoles.vue'
import AdminRiskAssessmentRoleView from './views/admin/riskassessment/RiskRole.vue'
import AdminGenerateReportsView from './views/admin/AdminGenerateReports.vue'
import AdminDownloadUpload from './views/admin/AdminDownloadUpload.vue'

import FourZeroThree from './views/codes/FourZeroThree.vue'
import FourZeroFour from './views/codes/FourZeroFour.vue'

import store from './store'

Vue.use(Router)

// Adding the false metas for completeness sake
const router = new Router({
  mode: 'history',
  routes: [
    // ========== Accont  =======================================================
    {
      path: '/account/login',
      name: 'account-login',
      props: true,
      component: AccountLoginView,
      meta: {
        requiresAuth: false,
        requiresAdmin : false
      }
    },
    {
      path: '/account/logout',
      name: 'account-logout',
      props: true,
      component: AccountLogoutView,
      meta: {
        requiresAuth: true,
        requiresAdmin : false
      }
    },
    // ========== Home  ========================================================
    {
      path: '/',
      name: 'home',
      props: true,
      component: HomeView,
      meta: {
        requiresAuth: true,
        requiresAdmin : false
      }
    },
    // ========== Services  ====================================================
    {
      path: '/services',
      name: 'services',
      props: true,
      component: ServicesView,
      meta: {
        requiresAuth: true,
        requiresAdmin : false
      }
    },
    {
      path: '/service/:serviceId',
      name: 'service',
      props: true,
      component: ServiceView,
      meta: {
        requiresAuth: true,
        requiresAdmin : false
      }
    },
    // ========== Roles  =======================================================
    {
      path: '/roles',
      name: 'roles',
      props: true,
      component: RolesView,
      meta: {
        requiresAuth: true,
        requiresAdmin : false
      }
    },
    {
      path: '/role/:roleId',
      name: 'role',
      props: true,
      component: RoleView,
      meta: {
        requiresAuth: true,
        requiresAdmin : false
      }
    },
    // ========== Users  =======================================================
    {
      path: '/users',
      name: 'users',
      props: true,
      component: UsersView,
      meta: {
        requiresAuth: true,
        requiresAdmin : false
      }
    },
    // ========== Admin  =======================================================
    {
      path: '/admin',
      name: 'admin',
      props: true,
      component: AdminView,
      meta: {
        requiresAuth: true,
        requiresAdmin : true
      }
    },
    {
      path: '/admin/risk-assessment',
      name: 'admin-risk-assessment',
      props: true,
      component: AdminRiskAssessmentRolesView,
      meta: {
        requiresAuth: true,
        requiresAdmin : true
      }
    },
    {
      path: '/admin/risk-assessment/:roleId',
      name: 'admin-risk-assessment-role',
      props: true,
      component: AdminRiskAssessmentRoleView,
      meta: {
        requiresAuth: true,
        requiresAdmin : true
      }
    },
    {
      path: '/admin/generate-reports',
      name: 'admin-generate-reports',
      props: true,
      component: AdminGenerateReportsView,
      meta: {
        requiresAuth: true,
        requiresAdmin : true
      }
    },
    {
      path: '/admin/download-upload',
      name: 'admin-download-upload',
      props: true,
      component: AdminDownloadUpload,
      meta: {
        requiresAuth: true,
        requiresAdmin : true
      }
    },
    // ========== Catchalls  ===================================================
    {
      path: '/forbidden',
      name: 'four-zero-three',
      props: true,
      component: FourZeroThree,
      meta: {
        requiresAuth: false,
        requiresAdmin : false
      }
    },
    {
      path: '*',
      name: 'four-zero-four',
      props: true,
      component: FourZeroFour,
      meta: {
        requiresAuth: false,
        requiresAdmin : false
      }
    },
  ]
})



router.beforeEach((to, from, next) => {

  if (store.state.account.isAuthenticated != true) {
    store.dispatch("getAuthenticationStatus")
  }

  // Reset the tab index for pages like service, role and risk assessment to 0,
  // only affects changing routes and not the updates when vue detects somevalue
  // has changed and thus refreshes the page data
  store.commit('SET_TAB_CURRENTLY_OPEN', 0)

  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (store.state.account.isAdmin !== true) {
      next({
        path: '/forbidden'
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.state.account.isAuthenticated !== true) {
      next({
        path: '/account/login'
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
