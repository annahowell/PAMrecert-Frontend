<template>
  <div>
    <h2 class="font-weight-normal mt-5 mb-5">Privileged Access Recertification - My Users</h2>

    <p class="pb-3">Use the table below to allocate a different role to your users.</p>

    <div class="mb-1" style="display:block!important">&nbsp;</div>

    {{ /* ========================== Table ======================== */ }}

    <b-table
      striped
      outlined
      head-variant="light"
      class="fs-90"
      :key="myUsers.UserId"
      :current-page="currentPage"
      :per-page="userPerPageChoice"
      :fields="fields"
      :items="myUsers"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :busy="loadingState"
      show-empty>

      <template v-slot:cell(updateForm)="row">
        <user-form :rowItem="row.item" />
      </template>

      {{ /* ====================== Busy slot ====================== */ }}

      <template v-slot:table-busy>
        <div class="text-center mt-5 mb-5">
          <b-spinner small class="align-middle"></b-spinner>
          <strong class="ml-2">Loading...</strong>
        </div>
      </template>

      {{ /* ======================== Empty ======================== */ }}

      <template v-slot:empty>
        <div class="text-muted">
          <p class="mb-0">There are no users assigned to you.</p>
        </div>
      </template>
    </b-table>

    <b-row>
      <b-col cols="6">
        <label class="mb-0 fs-85 mr-1" for="per-page" >Items Per Page:</label>
        <b-form-select v-model="userPerPageChoice" size="sm" id="per-page" style="width:70px!important">
          <option v-for="perPage in perPageOptions" :key="perPage.value" :value="perPage.value">
            {{perPage.text}}
          </option>
        </b-form-select>
      </b-col>
      <b-col cols="6">
        <b-pagination
          v-if="totalRows > userPerPageChoice"
          v-model="currentPage"
          :total-rows=totalRows
          :per-page="userPerPageChoice"
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

import UserForm from '@/components/forms/UserForm'

export default {
  components: {
    UserForm
  },
  // props: ,
  data () {
    return {
      sortBy: 'UserFullName',
      sortDesc: false,
      fields: [
        {
          key: 'UserFullName',
          label: 'Full Name',
          sortable: true,
          class: 'align-middle'
        },
        {
          key: 'RoleName',
          label: 'Current Role',
          sortable: true,
          tdClass: 'align-middle'
        },
        {
          key: 'updateForm',
          label: 'Update Role',
          sortable: false,
          tdClass: 'align-middle'
        }
      ],
      currentPage: 1,
      totalRows: 0,
      perPage: 10
    }
  },
  mounted () {
    this.$store.commit('SET_LOADING_STATE', {caller: 'users', state: true})

    this.totalRows = this.myUsers.length
  },
  updated() {
    this.$store.commit('SET_LOADING_STATE', {caller: 'users', state: false})
  },
  computed: {
    userPerPageChoice: {
      // State can save choice despite page changes
      get () { return this.$store.state.userPerPageChoice},
      set (value) {
        this.currentPage = 1
        this.$store.commit('SET_USER_PER_PAGE_CHOICE', value)
      }
    },
    ...mapState([
      'currentRecertCycle',
      'lastRecertCycle',
      'loadingState',
      'perPageOptions',
      'myUsers'
    ])
  },
  methods: {
  },
  watch: {
    myUsers () {
      this.totalRows = this.myUsers.length
    }
  }
}
</script>
