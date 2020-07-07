<template>
  <div>
    <h2 class="font-weight-normal mt-5 mb-5">Admin - Generate CSV Reports</h2>

    <p class="pb-0">Select at least a base date and time to download a report. Be aware that {{this.$friendlyDateTime(this.oldestAllowedDateTime)}} is the earliest that will return any data.</p>

    <b-form-group class="mb-3 pb-1">
      You can make a selection using:
      <b-form-radio v-model="selectionType" name="selectedBaseDateTimeRadio" value="picker" class="ml-2" inline>Date and time picker</b-form-radio>
      <b-form-radio v-model="selectionType" name="selectedBaseDateTimeRadio" value="cycle" inline>Recert cycle</b-form-radio>
    </b-form-group>

    <b-row cols="12" class="mb-4 pb-2">

      <b-col cols="5">

          {{ /* ======================= Base datetime ========================= */ }}

          <b-card header="Select base date time:">

            <div v-if="selectionType === 'picker'">
              <b-row>
                <b-col cols="3" class="vertical-center">Date:</b-col>
                <b-col cols="9">
                  <b-form-datepicker :max="currentDate" :min="oldestAllowedDate" placeholder="Choose a date" size="sm" v-model="baseDate" class="mb-3"></b-form-datepicker>
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="3">Time:</b-col>
                <b-col cols="9">
                  <b-form-timepicker placeholder="Choose a time" size="sm" v-model="baseTime" locale="en"></b-form-timepicker>
                </b-col>
              </b-row>
            </div>

            <b-row v-if="selectionType === 'cycle'">
              <b-col cols="3">Cycle:</b-col>
              <b-col cols="9">
                <b-form-select v-model="baseCycleSelectionId" id="baseCycleSelectionId" @change="calculateRecertCyclesAllowedForB()" size="sm">
                  <b-form-select-option value="none" disabled>Please select an option...</b-form-select-option>
                  <b-form-select-option v-for="recertCycle in allRecertCycles" :key="recertCycle.RecertCycleId" :value="recertCycle.RecertCycleId">
                    {{recertCycle.RecertCycleTitle}}
                    <span v-if="recertCycle.RecertCycleId === oldestOfCycleA && allRecertCycles.length > 1"> (oldest)</span>
                    <span v-if="recertCycle.RecertCycleId === latestOfCycleA && allRecertCycles.length > 1"> (latest)</span>
                  </b-form-select-option>
                </b-form-select>
              </b-col>
            </b-row>
        </b-card>
      </b-col>

      <b-col cols="5" offset="2" v-if="allRecertCycles.length > 1" >

        {{ /* ======================= Delta datetime ======================== */ }}

        <b-card header="Select date time for calculating delta reports:">

            <div v-if="selectionType === 'picker'">
              <b-row>
                <b-col cols="3" class="vertical-center">Date:</b-col>
                <b-col cols="9">
                  <b-form-datepicker :max="currentDate" :min="oldestAllowedDate" placeholder="Choose a date" size="sm" v-model="deltaDate" class="mb-3"></b-form-datepicker>
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="3">Time:</b-col>
                <b-col cols="9">
                  <b-form-timepicker placeholder="Choose a time" size="sm" min="12:00:00" v-model="deltaTime" locale="en"></b-form-timepicker>
                </b-col>
              </b-row>
            </div>

            <b-row v-if="selectionType === 'cycle'">
              <b-col cols="3">Cycle:</b-col>
              <b-col cols="9">
                <b-form-select v-model="deltaCycleSelectionId" id="deltaCycleSelectionId" size="sm">
                  <b-form-select-option value="none" disabled>Please select an option...</b-form-select-option>
                  <b-form-select-option v-for="recertCycle in recertCyclesAllowedForB" :key="recertCycle.RecertCycleId" :value="recertCycle.RecertCycleId">
                    {{recertCycle.RecertCycleTitle}}
                    <span v-if="recertCycle.RecertCycleId === oldestOfCycleB && recertCyclesAllowedForB.length > 1"> (oldest)</span>
                    <span v-if="recertCycle.RecertCycleId === latestOfCycleB && recertCyclesAllowedForB.length > 1"> (latest)</span>
                  </b-form-select-option>
                </b-form-select>
              </b-col>
            </b-row>
        </b-card>
      </b-col>
    </b-row>

    {{ /* ======================= Report table ========================= */ }}

    <b-table
      striped
      outlined
      head-variant="light"
      class="fs-90"
      :fields="fields"
      :items="items"
      :busy="loadingState"
      show-empty>

      <template v-slot:cell(DownloadButton)="row">
        <b-button v-if="row.item.ReportId === 'role' || row.item.ReportId === 'roleDiffer'"
          :disabled="!canDownloadBase"
          size="sm"
          variant="primary"
          aria-hidden="true"
          @click="handleReportDownload(row.item.ReportId)"
          >Download
        </b-button>

        <b-button v-else
          :disabled="!canDownloadDelta"
          size="sm"
          variant="primary"
          aria-hidden="true"
          @click="handleReportDownload(row.item.ReportId)"
          >Download
        </b-button>
      </template>

      <template v-slot:table-busy>
        <div class="text-center mt-5 mb-5">
          <b-spinner small class="align-middle"></b-spinner>
          <strong class="ml-2">Loading...</strong>
        </div>
      </template>

    </b-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {
      selectionType: 'cycle',

      oldestAllowedDateTime: null,
      oldestAllowedDate: null,

      currentDate: this.$currentDate(),
      baseDate: this.$currentDate(),
      baseTime: this.$currentTime(),
      baseCycleSelectionId: 'none',

      deltaDate: null,
      deltaTime: '17:00:00',
      deltaCycleSelectionId: 'none',

      recertCyclesAllowedForB: null,

      fields: [
        {key: 'ReportType', label: 'Report type', class: 'align-middle'},
        {key: 'DownloadButton', label: '', tdClass: 'align-middle text-right'}
      ],
      items: [
        { ReportId: 'role', ReportType: 'Role recertification information as of the selected date and time or recertification cycle'},
        { ReportId: 'roleDiffer', ReportType: 'Roles where service owners and role owners certifications differ, as of the selected date and time or recertification cycle'},
        { ReportId: 'roleDelta', ReportType: 'Delta of all recertification and risk assessment data (if differences exist) between the selected dates  and times or recertification cycles'},
        { ReportId: 'userDelta', ReportType: 'Delta of all user data (if differences exist) between the selected dates and times or recertification cycles'}
      ]
    }
  },
  created () {
    this.$store.dispatch("getAllRecertCycles", {startLoading: true, endLoading: true})

  },
  computed: {
    canDownloadBase () {
      return this.selectionType !== 'cycle' || this.baseCycleSelectionId !== 'none'
    },
    canDownloadDelta () {
      return this.selectionType !== 'cycle' || (this.baseCycleSelectionId !== 'none' && this.deltaCycleSelectionId !== 'none')
    },
    latestOfCycleA () {
      return this.allRecertCycles[0].RecertCycleId
    },
    oldestOfCycleA () {
      return this.allRecertCycles[this.allRecertCycles.length - 1].RecertCycleId
    },
    latestOfCycleB () {
      return this.recertCyclesAllowedForB[0].RecertCycleId
    },
    oldestOfCycleB () {
      return this.recertCyclesAllowedForB[this.recertCyclesAllowedForB.length - 1].RecertCycleId
    },
    ...mapState([
      'allRecertCycles',
      'currentRecertCycle',
      'lastRecertCycle',
      'loadingState'
    ])
  },
  methods: {
    // Calculate the possible allowed cycle for second datetime when the first datetime is chosen
    calculateRecertCyclesAllowedForB () {
      this.recertCyclesAllowedForB = this.allRecertCycles.filter(item => item.RecertCycleId !== this.baseCycleSelectionId)

      if (this.baseCycleSelectionId === this.deltaCycleSelectionId) {
        this.deltaCycleSelectionId = 'none'
      }
    },
    handleReportDownload (reportId) {
      if (this.canDownloadBase) {

        if (reportId === "role") {
          this.$store.dispatch("getRoleCsvX", {vm: this, baseDateTime: this.calculateBaseDateTime(), startLoading: true, endLoading: true})

        } else if ( reportId === 'roleDiffer') {
          this.$store.dispatch("getRoleDifferCsvX", {vm: this, baseDateTime: this.calculateBaseDateTime(), startLoading: true, endLoading: true})

        } else if (this.canDownloadDelta) {

          if (reportId === "roleDelta") {
            this.$store.dispatch("getRoleDeltaCsvXx", {vm: this, baseDateTime: this.calculateBaseDateTime(), deltaDateTime: this.calculateDeltaDateTime(), startLoading: true, endLoading: true})

          } else if ( reportId === 'userDelta') {
            this.$store.dispatch("getUserDeltaCsvXx", {vm: this, baseDateTime: this.calculateBaseDateTime(), deltaDateTime: this.calculateDeltaDateTime(), startLoading: true, endLoading: true})
          }
        }
      }
    },
    // Generate a API consumable base datetime for either cycle or picker
    calculateBaseDateTime () {
      if (this.selectionType === 'picker') {
        return this.baseDate + 'T' + this.baseTime
      } else {
        if (this.baseCycleSelectionId === this.currentRecertCycle.RecertCycleId) {
          return this.$currentDate() + 'T' + this.$currentTime()
        } else {
          return this.allRecertCycles.filter(item => item.RecertCycleId === this.baseCycleSelectionId)[0].RecertEndedDate
        }
      }
    },
    // Generate a API consumable delta datetime for either cycle or picker
    calculateDeltaDateTime () {
      if (this.selectionType === 'picker') {
        return this.deltaDate + 'T' + this.deltaTime
      } else {
        if (this.deltaCycleSelectionId === this.currentRecertCycle.RecertCycleId) {
          return this.$currentDate() + 'T' + this.$currentTime()
        } else {
          return this.allRecertCycles.filter(item => item.RecertCycleId === this.deltaCycleSelectionId)[0].RecertEndedDate
        }
      }
    }
  },
  watch: {
    allRecertCycles () {
      this.recertCyclesAllowedForB = this.allRecertCycles

      this.oldestAllowedDateTime = this.allRecertCycles[this.allRecertCycles.length - 1].RecertEndedDate
      this.oldestAllowedDate = this.$computeDate(this.oldestAllowedDateTime)
      this.deltaDate = this.oldestAllowedDate
    }
  }
}
</script>
