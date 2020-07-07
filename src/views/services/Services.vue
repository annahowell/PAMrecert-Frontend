<template>
  <div>
    <h2 class="font-weight-normal mt-5 mb-5">Privileged Access Recertification - My Services</h2>

    <p class="pb-3">Select a service below to begin recertifying the privilege level assigned to the roles using the service.</p>

    <b-form-checkbox
      class="text-right mb-1"
      id="hide-completed"
      v-model="hideCertifiedOrEmpty"
      name="hide-completed"
    >Hide Certified or Empty Services</b-form-checkbox>

    {{ /* ========================== Table ======================== */ }}

    <b-table
      striped
      outlined
      head-variant="light"
      class="fs-90"
      :key="filteredServices.ServiceId"
      :current-page="currentPage"
      :per-page="servicePerPageChoice"
      :fields="fields"
      :items=filteredServices
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :busy="loadingState"
      show-empty>

      <template v-slot:cell(recertfyButton)="row">
        <b-button
          size="sm"
          variant="primary"
          style="width:80px!important"
          aria-hidden="true"
          :to="{name: 'service', params: { serviceId: row.item.ServiceId }}"
          >Recertify
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
        <div v-if="hideCertifiedOrEmpty" class="text-muted">
          <p>Certification of all services has been completed, or there are no services assigned to you.</p>
          <p class="mb-0">To view any of your completed services untick the 'Hide Certified or Empty Services' box above.</p>
        </div>
        <div v-else class="text-muted">
          <p class="mb-0">There are no servicess assigned to you.</p>
        </div>
      </template>

    </b-table>

    <b-row>
      <b-col cols="6">
        <label class="mb-0 fs-85 mr-1" for="per-page" >Items Per Page:</label>
        <b-form-select v-model="servicePerPageChoice" size="sm" id="per-page" style="width:70px!important">
          <option v-for="perPage in perPageOptions" :key="perPage.value" :value="perPage.value">
            {{perPage.text}}
          </option>
        </b-form-select>
      </b-col>
      <b-col cols="6">
        <b-pagination
          v-if="totalRows > servicePerPageChoice"
          v-model="currentPage"
          :total-rows=totalRows
          :per-page="servicePerPageChoice"
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
      sortBy: 'ServiceName',
      sortDesc: false,
      fields: [
        {
          key: 'ServiceName',
          label: 'Service Name',
          sortable: true,
          class: 'align-middle'
        },
        {
          key: 'ServiceDescription',
          label: 'Service Description',
          sortable: false,
          tdClass: 'align-middle'
        },
        {
          key: 'recertfyButton',
          label: '',
          sortable: false,
          tdClass: 'align-middle text-right'
        }
      ],
      currentPage: 1,
      totalRows: 0
    }
  },
  mounted () {
    this.$store.commit('SET_LOADING_STATE', {caller: 'services', state: true})

    this.totalRows = this.filteredServices.length
  },
  updated() {
    this.$store.commit('SET_LOADING_STATE', {caller: 'services', state: false})
  },
  computed: {
    filteredServices: function() {
      if (this.hideCertifiedOrEmpty) {
        return this.myServices.filter(function(r) {
          // filter out non fully certified services
          return !r.FullyCertified
        })
      } else {
        // else filter nothing
        return this.myServices
      }
    },
    hideCertifiedOrEmpty: {
      // State can save choices despite page changes
      get () { return this.$store.state.hideCertifiedOrEmpty },
      set (value) {
        this.currentPage = 1
        this.$store.commit('SET_HIDE_CERTIFIED_OR_EMPTY', value)
      }
    },
    servicePerPageChoice: {
      get () { return this.$store.state.servicePerPageChoice },
      set (value) {
        this.currentPage = 1
        this.$store.commit('SET_SERVICE_PER_PAGE_CHOICE', value)
      }
    },
    ...mapState([
      'currentRecertCycle',
      'lastRecertCycle',
      'loadingState',
      'perPageOptions',
      'myServices'
    ])
  },
  watch: {
    servicePerPageChoice () {
      this.totalRows = this.filteredServices.length
    },
    filteredServices () {
      this.totalRows = this.filteredServices.length
    }
  }
}
</script>
