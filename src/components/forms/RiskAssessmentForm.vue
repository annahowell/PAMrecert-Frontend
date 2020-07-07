<template>
  <div>
    <b-row>
      <b-col cols="12" class="mb-4">
        {{ /* We can use RoleOwner.ServiceName or ServiceOwner.ServiceName below as the service is the same for either user */ }}
        <p class="m-0">You are assessing risk associated with the privilege level a <b>{{this.roleName}}</b> role has on the <b>{{riskAssessmentServicePriv.RoleOwner_ServiceName}}</b> service.</p>

        <b-alert v-if="this.riskAssessmentServicePriv.RiskIsAssessed" variant="warning" class="mt-4 text-center" show>
          A risk assessment has already been completed for this role and service during the current recertification cycle. You may reassess the risk or amend notes using the <b-link v-scroll-to="'#riskAssessmentForm' + this.uniqueId">form</b-link> below.
        </b-alert>
      </b-col>
    </b-row>

    {{ /* ====================== Service Owner Cert ====================== */ }}

    <b-row>
      <b-col cols="12" class="text-center mb-0">
        <h5 class="mt-3">Service Owners Certification</h5>
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col cols="3">Privilege certified: </b-col>

      <b-col cols="5" v-if="riskAssessmentServicePriv.ServiceOwner_IsRevoked"><b-badge variant="success">Revoked</b-badge></b-col>
      <b-col cols="5" v-else>{{riskAssessmentServicePriv.ServiceOwner_PermissionGroup}}</b-col>
      <b-col cols="4" class="text-right">
        <b-button variant="primary" @click="toggleServiceOwnerCollapse()" size="sm">
          <span v-if="this.serviceOwnerCollapsed">Show</span><span v-else>Hide</span> previous recert data</b-button>
      </b-col>
    </b-row>

    <b-row class="mb-4">
      <b-col cols="3">Date certified: </b-col>
      <b-col cols="9">{{this.$friendlyDateTime(this.riskAssessmentServicePriv.ServiceOwner_DateCertified)}}</b-col>
    </b-row>

    <b-row class="mb-4" v-if="!riskAssessmentServicePriv.ServiceOwner_IsRevoked">
      <b-col cols="3">Privilege summary: </b-col>
      <b-col cols="9">{{riskAssessmentServicePriv.ServiceOwner_ServicePrivSummary}}</b-col>
    </b-row>

    <b-row class="mb-4">
      <b-col cols="3">Justification: </b-col>
      <b-col cols="9">{{riskAssessmentServicePriv.ServiceOwner_RoleAccessJustification}}</b-col>
    </b-row>

    <b-row class="mb-5">
      <b-col cols="3">Removal impact: </b-col>
      <b-col cols="9">{{riskAssessmentServicePriv.ServiceOwner_RemovalImpact}}</b-col>
    </b-row>


    <b-collapse :id="'serviceOwnerCollapse' + this.uniqueId" style="opacity:0.75">
      <b-row class="mb-4">
        <b-col cols="3">Previous privilege: </b-col>

        <b-col cols="5" v-if="previousRiskAssessmentServicePriv.ServiceOwner_IsRevoked"><b-badge variant="success">Revoked</b-badge></b-col>
        <b-col cols="5" v-else>{{previousRiskAssessmentServicePriv.ServiceOwner_PermissionGroup}}</b-col>
      </b-row>

      <b-row class="mb-4">
        <b-col cols="3">Previous date certified: </b-col>
        <b-col cols="9">{{this.$friendlyDateTime(this.previousRiskAssessmentServicePriv.ServiceOwner_DateCertified)}}</b-col>
      </b-row>

      <b-row class="mb-4" v-if="!previousRiskAssessmentServicePriv.ServiceOwner_IsRevoked">
        <b-col cols="3">Previous summary: </b-col>
        <b-col cols="9">{{previousRiskAssessmentServicePriv.ServiceOwner_ServicePrivSummary}}</b-col>
      </b-row>

      <b-row class="mb-4">
        <b-col cols="3">Previous justification: </b-col>
        <b-col cols="9">{{previousRiskAssessmentServicePriv.ServiceOwner_RoleAccessJustification}}</b-col>
      </b-row>

      <b-row class="mb-5">
        <b-col cols="3">Previous removal impact: </b-col>
        <b-col cols="9">{{previousRiskAssessmentServicePriv.ServiceOwner_RemovalImpact}}</b-col>
      </b-row>
    </b-collapse>

    {{ /* ========================= Role Owner Cert ========================= */ }}

    <b-row>
      <b-col cols="12" class="text-center mb-0">
        <h5 class="top-separator pt-5">Role Owners Certification</h5>
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col cols="3">Privilege certified: </b-col>

      <b-col cols="5" v-if="riskAssessmentServicePriv.RoleOwner_IsRevoked"><b-badge variant="success">Revoked</b-badge></b-col>
      <b-col cols="5" v-else>{{riskAssessmentServicePriv.RoleOwner_PermissionGroup}}</b-col>
      <b-col cols="4" class="text-right">
        <b-button variant="primary" @click="toggleRoleOwnerCollapse()" size="sm">
          <span v-if="this.roleOwnerCollapsed">Show</span><span v-else>Hide</span> previous recert data</b-button>
      </b-col>
    </b-row>

    <b-row class="mb-4">
      <b-col cols="3">Date certified: </b-col>
      <b-col cols="9">{{this.$friendlyDateTime(this.riskAssessmentServicePriv.RoleOwner_DateCertified)}}</b-col>
    </b-row>

    <b-row class="mb-4" v-if="!riskAssessmentServicePriv.RoleOwner_IsRevoked">
      <b-col cols="3">Privilege summary: </b-col>
      <b-col cols="9">{{riskAssessmentServicePriv.RoleOwner_ServicePrivSummary}}</b-col>
    </b-row>

    <b-row class="mb-4">
      <b-col cols="3">Justification: </b-col>
      <b-col cols="9">{{riskAssessmentServicePriv.RoleOwner_RoleAccessJustification}}</b-col>
    </b-row>

    <b-row class="mb-5">
      <b-col cols="3">Removal impact: </b-col>
      <b-col cols="9">{{riskAssessmentServicePriv.RoleOwner_RemovalImpact}}</b-col>
    </b-row>


    <b-collapse :id="'roleOwnerCollapse' + this.uniqueId" style="opacity:0.75">
      <b-row class="mb-4">
        <b-col cols="3">Previous privilege: </b-col>

        <b-col cols="5" v-if="previousRiskAssessmentServicePriv.RoleOwner_IsRevoked"><b-badge variant="success">Revoked</b-badge></b-col>
        <b-col cols="5" v-else>{{previousRiskAssessmentServicePriv.RoleOwner_PermissionGroup}}</b-col>
      </b-row>

      <b-row class="mb-4">
        <b-col cols="3">Previous date certified: </b-col>
        <b-col cols="9">{{this.$friendlyDateTime(this.previousRiskAssessmentServicePriv.RoleOwner_DateCertified)}}</b-col>
      </b-row>

      <b-row class="mb-4" v-if="!previousRiskAssessmentServicePriv.RoleOwner_IsRevoked">
        <b-col cols="3">Previous summary: </b-col>
        <b-col cols="9">{{previousRiskAssessmentServicePriv.RoleOwner_ServicePrivSummary}}</b-col>
      </b-row>

      <b-row class="mb-4">
        <b-col cols="3">Previous justification: </b-col>
        <b-col cols="9">{{previousRiskAssessmentServicePriv.RoleOwner_RoleAccessJustification}}</b-col>
      </b-row>

      <b-row class="mb-5">
        <b-col cols="3">Previous removal impact: </b-col>
        <b-col cols="9">{{previousRiskAssessmentServicePriv.RoleOwner_RemovalImpact}}</b-col>
      </b-row>
    </b-collapse>

    {{ /* ================================================================ */ }}
    {{ /*                            FORM BEGINS                           */ }}
    {{ /* ================================================================ */ }}

    <b-row class="m-0 mb-5">
      <b-col class="p-0">
        <div class="separator">Assess the risk of the {{this.roleName}} privilege level on {{riskAssessmentServicePriv.RoleOwner_ServiceName}}</div>
      </b-col>
    </b-row>

    <b-form :id="'riskAssessmentForm' + this.uniqueId" :ref="'riskAssessmentForm' + this.uniqueId" v-on:submit.prevent="submitForm">

      {{ /* ======================== Risk Impact ========================== */ }}

      <b-row>
        <b-col cols="12">
          <b-form-group
            :label-for="'selectedRiskImpact' + this.uniqueId"
            class="pb-2"
            invalid-feedback="A risk impact is required" label-cols="3">

            <template v-slot:label>Risk impact:</template>

              <b-form-select required style="max-width:250px" v-model="form.RiskImpact" :id="'selectedRiskImpact' + this.uniqueId" size="sm">
                <option value="none" disabled>Select risk impact...</option>
                <option v-for="no in 5" :key="no" :value="no">
                  {{no}}
                </option>
              </b-form-select>
          </b-form-group>
        </b-col>
      </b-row>

        {{ /* ====================== Risk Likelihood ======================== */ }}

      <b-row>
        <b-col cols="12">
          <b-form-group
            :label-for="'selectedRiskLikelihood' + this.uniqueId"
            class="pb-2"
            invalid-feedback="A risk likelihood is required" label-cols="3">

            <template v-slot:label>Risk likelihood:</template>

              <b-form-select required style="max-width:250px" v-model="form.RiskLikelihood" :id="'selectedRiskLikelihood' + this.uniqueId" size="sm">
                <option value="none" disabled>Select a risk likelihood...</option>
                <option v-for="no in 5" :key="no" :value="no">
                  {{no}}
                </option>
              </b-form-select>
          </b-form-group>
        </b-col>

      {{ /* ========================= Risk Rating ======================== */ }}

      <transition name="fade">
        <b-col cols="12" v-show="this.form.RiskImpact != 'none' && this.form.RiskLikelihood != 'none'">
          <b-form-group
            :label-for="'selectedRiskLikelihood' + this.uniqueId"
            class="pb-2"
            invalid-feedback="A risk likelihood is required" label-cols="3">

            <template v-slot:label>Calculated risk rating:</template>

            <h5 class="mt-0 mb-0">
              <b-badge v-if="riskRating < 5" variant="success">{{riskRating}}</b-badge>
              <b-badge v-if="riskRating >= 5  && riskRating < 15" variant="warning">{{riskRating}}</b-badge>
              <b-badge v-if="riskRating >= 15" variant="danger">{{riskRating}}</b-badge>
            </h5>
          </b-form-group>
        </b-col>
      </transition>
    </b-row>

      {{ /* ========================= Risk Notes ========================= */ }}

    <b-row>
      <b-col cols="12">
        <b-form-group
          :state="riskNotesState"
          :label-for="'riskNotes' + this.uniqueId"
          class="pb-2"
          label-cols="3">

          <template v-slot:label>Risk notes:</template>

          <b-form-textarea
            :state="riskNotesState"
            :id="'riskNotes' + this.uniqueId"
            v-model="form.RiskNotes"
            size="sm"
            rows="7"
            class="mh-90"
          ></b-form-textarea>

          <b-tooltip :target="'riskNotes' + this.uniqueId" triggers="hover" variant="secondary">
            Notes cannot be viewed by service owners or role owners and may only be viewed by other admins.
          </b-tooltip>
        </b-form-group>
      </b-col>
    </b-row>

      {{ /* ========================== Tick box ========================== */ }}

    <b-row>
      <b-col class="text-right" cols="12">
        <b-button variant="primary" :disabled=disableButton type="submit" class="fs-90"><span v-if="this.riskAssessmentServicePriv.RiskIsAssessed">Update</span><span v-else>Submit</span> Risk Assessment</b-button>
      </b-col>
    </b-row>
    </b-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: ['roleId', 'roleName', 'riskAssessmentServicePriv', 'previousRiskAssessmentServicePriv'],
  data () {
    return {
      form: {
        RiskImpact: 'none',
        RiskLikelihood: 'none',
        RiskNotes: null,
        RiskAssessmentDate: null
      },
      uniqueId: this.riskAssessmentServicePriv.RolePrivId,
      selectedPrivDetails: [],
      riskNotesState: null,
      serviceOwnerCollapsed: true,
      roleOwnerCollapsed: true
    }
  },
  created () {
    this.populateForm()
  },
  computed: {
    riskRating () {
      return this.form.RiskImpact * this.form.RiskLikelihood
    },
    disableButton () {
      return this.form.RiskImpact === 'none' || this.form.RiskLikelihood === 'none'
    },
    ...mapState([
      'lastRecertCycle'
    ])
  },
  methods: {
    toggleServiceOwnerCollapse () {
      this.serviceOwnerCollapsed = !this.serviceOwnerCollapsed
      this.$root.$emit('bv::toggle::collapse', 'serviceOwnerCollapse' + this.uniqueId)

    },
    toggleRoleOwnerCollapse () {
      this.roleOwnerCollapsed = !this.roleOwnerCollapsed
      this.$root.$emit('bv::toggle::collapse', 'roleOwnerCollapse' + this.uniqueId)
    },
    // Populate the form if this role has been risk assessed during this recert cycle
    populateForm () {
      if (this.riskAssessmentServicePriv.RiskIsAssessed) {
        this.form.RiskImpact = this.riskAssessmentServicePriv.RiskImpact
        this.form.RiskLikelihood = this.riskAssessmentServicePriv.RiskLikelihood
        this.form.RiskNotes = this.riskAssessmentServicePriv.RiskNotes
      }
    },
    submitForm () {
      if (this.form.RiskImpact !== 'none' && this.form.RiskLikelihood !== 'none') {

        let data = {
          roleId: this.roleId,
          rolePrivId: this.riskAssessmentServicePriv.RolePrivId,
          formData: {
            RiskImpact: this.form.RiskImpact,
            RiskLikelihood: this.form.RiskLikelihood,
            RiskNotes: this.form.RiskNotes,
            RiskAssessmentDate:  this.$currentDateTime(),
            RiskIsAssessed: 1
          }
        }

        this.$store.dispatch('patchRoleServicePrivRiskAssessmentX', {vm: this, data: data})

        this.$scrollTo('#riskAssessmentForm' + this.uniqueId)
      }
    }
  },
  watch: {
    riskAssessmentServicePriv () {
      this.populateForm()
    }
  }
}
</script>

<style scoped>

span.badge {
  min-width: 36px!important;
}
</style>
