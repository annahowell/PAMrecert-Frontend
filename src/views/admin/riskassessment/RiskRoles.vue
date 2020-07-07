<template>
  <div>
    <h2 class="font-weight-normal mt-5 mb-5">Admin - Risk Assessment - Roles</h2>

    <p class="pb-3">Select a role below to begin a risk assessment.</p>

    <b-form-checkbox
      class="text-right mb-1"
      id="hide-uncertified"
      v-model="hideUnCertifiedOrEmpty"
      name="hide-uncertified"
      >Hide Uncertified or Empty Roles</b-form-checkbox>

    {{ /* ========================== Table ========================== */ }}

    <b-table
      striped
      outlined
      head-variant="light"
      class="fs-90"
      :key="filteredRoles.RoleId"
      :current-page="currentPage"
      :per-page="rolePerPageChoice"
      :fields="fields"
      :items=filteredRoles
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :busy="loadingState"
      show-empty>

      <template v-slot:cell(assessButton)="row">
        <b-button
          size="sm"
          variant="primary"
          style="width:70px!important"
          aria-hidden="true"
          :to="{name: 'admin-risk-assessment-role', params: { roleId: row.item.RoleId }}"
          >Assess
        </b-button>
      </template>


      {{ /* ====================== Busy slot ====================== */ }}

      <template v-slot:table-busy>
        <div class="text-center mt-5 mb-5">
          <b-spinner small class="align-middle"></b-spinner>
          <strong class="ml-2">Loading...</strong>
        </div>
      </template>

      {{ /* ======================== Empty ======================== */ }}

      <template v-slot:empty="scope">
        <div v-if="hideUnCertifiedOrEmpty" class="text-muted">
          <p>No roles have been certified by both service owners and role owners, or no roles have services assigned to them.</p>
          <p>To view any uncertified roles untick the 'Hide Uncertified or Empty Roles' box above.</p>
        </div>
        <div v-else class="text-muted">
          No roles have services assigned to them.
        </div>
      </template>

    </b-table>

    <b-row>
      <b-col cols="6">
        <label class="mb-0 fs-85 mr-1" for="per-page" >Items Per Page:</label>
        <b-form-select v-model="rolePerPageChoice" size="sm" id="per-page" style="width:70px!important">
          <option v-for="perPage in perPageOptions" :key="perPage.value" :value="perPage.value">
            {{perPage.text}}
          </option>
        </b-form-select>
      </b-col>
      <b-col cols="6">
        <b-pagination
          v-if="totalRows > rolePerPageChoice"
          v-model="currentPage"
          :total-rows=totalRows
          :per-page="rolePerPageChoice"
          size="sm"
          class="m-0"
          align="right"
        ></b-pagination>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {
      sortBy: 'RoleName',
      sortDesc: false,
      fields: [
        {
          key: 'RoleName',
          label: 'Role Name',
          sortable: true,
          class: 'align-middle'
        },
        {
          key: 'RoleDescription',
          label: 'Role Description',
          sortable: false,
          tdClass: 'align-middle'
        },
        {
          key: 'assessButton',
          label: '',
          sortable: false,
          tdClass: 'align-middle text-right'
        }
      ],
      currentPage: 1,
      totalRows: 0
    }
  },
  created () {
    // Unlike the service owner and role owner pages, where users are only viewing and updating their own
    // data, as an admin we need to get all the role data again, since service owners and role owners may
    // have made amendments since the store.js originally got this data at start of this website visit
    this.$store.dispatch("getAllRoles", {startLoading: true, endLoading: true})
  },
  mounted () {
    this.totalRows = this.filteredRoles.length
  },
  computed: {
    filteredRoles: function() {
      if (this.hideUnCertifiedOrEmpty) {
        return this.allRoles.filter(function(r) {
          // filter out non fully certified roles
          return r.FullyCertified
        })
      } else {
        // else filter nothing
        return this.allRoles
      }
    },
    // State can save choices despite page changes
    hideUnCertifiedOrEmpty: {
      get () { return this.$store.state.hideUnCertifiedOrEmpty },
      set (value) {
        this.currentPage = 1
        this.$store.commit('SET_HIDE_UNCERTIFIED_OR_EMPTY', value)
      }
    },
    rolePerPageChoice: {
      get () { return this.$store.state.rolePerPageChoice },
      set (value) {
        this.currentPage = 1
        this.$store.commit('SET_ROLE_PER_PAGE_CHOICE', value)
      }
    },
    ...mapState([
      'currentRecertCycle',
      'lastRecertCycle',
      'loadingState',
      'perPageOptions',
      'allRoles'
    ])
  },
  methods: {
  },
  watch: {
    rolePerPageChoice () {
      this.totalRows = this.filteredRoles.length
    },
    filteredRoles () {
      this.totalRows = this.filteredRoles.length
    }
  }
}
</script>
