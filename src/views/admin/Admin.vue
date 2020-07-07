<template>
  <div>
    <div v-if="!loadingState">

      <b-row cols="12" class="mt-5 mb-5">
        <b-col cols="12" md="5" lg="7">
          <h2 class="font-weight-normal">Admin - Home</h2>
        </b-col>

        <b-col cols="12" md="7" lg="5" class="text-center">
          <b-card header-tag="h5" header="Current cycle summary">
            <b-row cols="12" class="text-left mb-1">
              <b-col cols="3">Title:</b-col>
              <b-col cols="9"><i>{{currentRecertCycle.RecertCycleTitle}}</i></b-col>
            </b-row>
            <b-row cols="12" class="text-left mb-1">
              <b-col cols="3">Started:</b-col>
              <b-col cols="9"><i>{{friendlyDateTime}}</i></b-col>
            </b-row>
            <b-row cols="12" class="text-left">
              <b-col cols="3">Status:</b-col>
              <b-col cols="9"><i>{{(currentRecertCycle.RecertEnabled ? "Enabled (Users can recertify)" : "Disabled (Users cannot recertify)")}}</i></b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>

      <b-alert v-if="currentRecertCycle.RecertCount === 1" variant="warning" show>
         <p>The only found recertification cycle is the initial (automatically generated) cycle. After ensuring each of your source .CSV data files are accurate, you should upload them using the button below and subsequently begin a new (enabled) recert cycle. Alternatively, if you have imported .SQL data files directly to the database server you may begin a new cycle now.</p>
         <p>Importing the data now and only then creating a new recert cycle allows the generation of reports containing just the changes made by users since the end of the initial recert cycle.</p>
         <p>Additional administrative functionality will be unlocked and displayed here when you have imported your data and then created a new cycle.</p>
      </b-alert>

      <b-card-group v-else deck>

        {{ /* ====================== Risk assessment ===================== */ }}

        <b-card class="pb-2" header="" header-tag="header" title="Risk assessment" bg-variant="light">
          <b-card-text>View submitted certifications, enter risk impact and likelihood ratings for submissions, view calculated risk ratings and enter private admin notes.</b-card-text>

          <template v-slot:footer>
            <div class="text-right">
              <b-btn :to="{name: 'admin-risk-assessment'}" variant="primary">Assess Risk</b-btn>
            </div>
          </template>
        </b-card>

        {{ /* ====================== Generate Reports ==================== */ }}

        <b-card class="pb-2" header="" header-tag="header" title="Generate reports" bg-variant="light">
          <b-card-text>Generate reports of role and user information.</b-card-text>

          <template v-slot:footer>
            <div class="text-right mb-1">
              <b-btn :to="{name: 'admin-generate-reports'}" variant="primary">Generate Reports</b-btn>
            </div>
          </template>
        </b-card>
      </b-card-group>

      {{ /* ==================== Rename current cycle ==================== */ }}

      <b-card-group deck class="mt-4 pt-2">

        <b-card class="pb-2" v-if="currentRecertCycle.RecertCount !== 1" header="" header-tag="header" title="Rename current recertification cycle" bg-variant="light">
          <b-card-text>Rename the current recertification cycle to something more appropriate. This is cosmetic and does not affect any other configuration values.</b-card-text>

          <template v-slot:footer>
            <div class="text-right">
              <b-btn href="#" variant="primary" @click="openNewCycleNameModal">Rename current cycle</b-btn>
            </div>
          </template>
        </b-card>

        {{ /* ========================= Data upload ======================== */ }}

        <b-card class="pb-2" header="" header-tag="header" title="Upload / download .csv files" bg-variant="light">
          <b-card-text>Download raw data from the database and overwrite or amend the database by uploading new data in .csv format.</b-card-text>

          <template v-slot:footer>
            <div class="text-right">
              <b-btn :to="{name: 'admin-download-upload'}" variant="primary">Upload / Download .CSV files</b-btn>
            </div>
          </template>
        </b-card>
      </b-card-group>

      <b-card-group deck class="mt-4 pt-2">

        {{ /* =============== Enable/disable current cycle =============== */ }}

        <b-card class="pb-2" v-if="currentRecertCycle.RecertCount !== 1" header="" header-tag="header" :title="(this.currentRecertCycle.RecertEnabled ? 'Disable' : 'Enable') + ' recertification cycle status'" bg-variant="light">
          <b-card-text>
            <span v-if="currentRecertCycle.RecertEnabled">
              <p>Disable the current recertification cycle in order to disallow service owners and role owners from conducting recertification actions.</p>
            </span>
            <span v-else>
              <p>Enable the current recertification cycle in order to allow service owners and role owners to conduct recertification actions.</p>
            </span>
            <p class="mb-0">This does not affect administrative actions.</p>
          </b-card-text>

          <template v-slot:footer>
            <b-form-checkbox
              required
              id="toggle-status-disabled-box"
              v-model="toggleStatusUnderstood"
              name="toggle-status-disabled-box"
              class="fs-90 mb-3"
            >
              <span v-if="currentRecertCycle.RecertEnabled">
                I understand that disabling the current recertification cycle will prevent service owners and role owners from performing recertification actions.
              </span>
              <span v-else>
                I understand that enabling the current recertification cycle will allow service owners and role owners to perform recertification actions.
              </span>
            </b-form-checkbox>

            <div class="text-right">
              <b-btn href="#" variant="danger" :disabled="isToggleStatusUnderstood" @click="toggleCycleStatus">
                <span v-if="currentRecertCycle.RecertEnabled">Disable Cycle</span>
                <span v-else>Enable Cycle</span>
              </b-btn>
            </div>
          </template>
        </b-card>

        {{ /* ==================== Start new cycle ==================== */ }}

        <b-card class="pb-2" header="" header-tag="header" title="Begin new recertification cycle" bg-variant="light">
          <b-card-text>Save a copy of the current risk assessment data (impact / likelihood / notes / date), and certification data (justification / removal impact / revocation / certification status), then empty these values in order to facilitate a new recertification. This should only be done at the start of each recertification cycle (i.e. annually).</b-card-text>

          <template v-slot:footer>
            <b-form-checkbox
              required
              id="reset-disabled-box"
              v-model="newCycleUnderstood"
              name="reset-disabled-box"
              class="fs-90 mb-3"
            >I understand that setting up a new recertification cycle is irreversible and will require all role owners to recertify the privileges of all services for each of their roles, that all service owners will have to recertify the privileges of the roles using their services, and that risk assessors will need to conduct new risk assessments.</b-form-checkbox>

            <div class="text-right">
              <b-btn href="#" variant="danger" :disabled="isNewCycleUnderstood" @click="openNewCycleModal">Begin New Cycle</b-btn>
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

    <admin-new-cycle-name-modal :currentRecertCycleId="currentRecertCycle.RecertCycleId"/>

    <admin-new-cycle-modal :currentRecertCycleId="currentRecertCycle.RecertCycleId"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import AdminNewCycleNameModal from '@/components/modals/AdminNewCycleNameModal'
import AdminNewCycleModal from '@/components/modals/AdminNewCycleModal'

export default {
  props: ['id'],
  components: {
    AdminNewCycleNameModal,
    AdminNewCycleModal
  },
  data () {
    return {
      toggleEnabledTitle: '',
      newCycleUnderstood: false,
      toggleStatusUnderstood: false
    }
  },
  mounted () {
    this.$store.commit('SET_LOADING_STATE', {caller: 'admin', state: true})
  },
  updated() {
    this.$store.commit('SET_LOADING_STATE', {caller: 'admin', state: false})
  },
  computed: {
    friendlyDateTime () {
      return this.$friendlyDateTime(this.currentRecertCycle.RecertStartedDate)
    },
    isNewCycleUnderstood () {
      return !this.newCycleUnderstood
    },
    isToggleStatusUnderstood () {
      return !this.toggleStatusUnderstood
    },
    ...mapState([
      'currentRecertCycle',
      'lastRecertCycle',
      'loadingState'
    ])
  },
  methods: {
    openNewCycleNameModal: function () {
      this.$bvModal.show('AdminNewCycleNameModal')

      this.newCycleUnderstood = false
      this.toggleStatusUnderstood = false
    },
    openNewCycleModal: function () {
      this.$bvModal.show('AdminNewCycleModal')

      this.newCycleUnderstood = false
      this.toggleStatusUnderstood = false
    },
    // This uses the built in prefab Modal because it's a basic yes/no
    toggleCycleStatus () {
      this.newCycleUnderstood = false
      this.toggleStatusUnderstood = false

      this.$bvModal.msgBoxConfirm("Are you sure you want to " + (this.currentRecertCycle.RecertEnabled ? "disable" : "enable") + " the current recertification cycle?", {
        title: 'Confirm ' + (this.currentRecertCycle.RecertEnabled ? "disable" : "enable"),
        size: 'md',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: (this.currentRecertCycle.RecertEnabled ? "Disable" : "Enable") + ' Cycle',
        cancelTitle: 'Cancel',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
        headerBgVariant: 'danger',
        headerTextVariant: 'light'
      })
      .then(choice => {
        if (choice === true) {
          // Keeping the same data format as patch for consistencies sake
          let data = {
            RecertCycleId: this.currentRecertCycle.RecertCycleId,
            formData: {
              RecertEnabled: !this.currentRecertCycle.RecertEnabled
            }
          }

          this.$store.dispatch('patchRecertCycle', {vm: this, data: data, startLoading: false, endLoading: false})
        }
      })
    }
  }
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
