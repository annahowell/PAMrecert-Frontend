<template>
  <div>
    <b-row>
      <b-col cols="12" class="mb-1">
        <p>You are recertifying the privilege a <b>{{serviceRolePriv.RoleName}}</b> role has on the <b>{{serviceName}}</b> service.</p>

        <b-alert v-if="this.serviceRolePriv.ServiceOwner_IsCertified" variant="warning" class="text-center mt-4 mb-4" show>
          The privilege level of the role for this service has already been certified during the current recertification cycle. You may amend your certification using the <b-link v-scroll-to="'#servicePrivForm' + this.uniqueId">form</b-link> below.
        </b-alert>

        <p v-if="serviceRolePriv.PreviousPriv != null">During the last certification cycle, the '<b>{{serviceRolePriv.PreviousPriv.PermissionGroup}}</b>' privilege level was certified for use by this role.
        If you choose to retain this privilege level, you must still complete the '<i>reason for access</i>' and '<i>impact if removed</i>' fields.</p>
      </b-col>
    </b-row>

    <b-row v-if="serviceRolePriv.PreviousPriv != null">
      <b-col cols="12"><p class="mt-3 mb-0">{{serviceRolePriv.PreviousPriv.PermissionGroup}} Privilege Summary:</p></b-col>
      <b-col cols="12"><p>{{serviceRolePriv.PreviousPriv.ServicePrivSummary}}</p></b-col>
    </b-row>

    <b-row style="margin:3rem 0 1.25rem">
      <b-col class="p-0">
        <div class="separator">Recertify {{this.serviceName}} privilege level for a {{serviceRolePriv.RoleName}}</div>
      </b-col>
    </b-row>

    {{ /* ================================================================ */ }}
    {{ /*                            FORM BEGINS                           */ }}
    {{ /* ================================================================ */ }}

    <b-form :id="'servicePrivForm' + this.uniqueId" :ref="'servicePrivForm' + this.uniqueId" v-on:submit.prevent="submitForm">

      {{ /* ======================== Select box ========================== */ }}

      <b-form-group
        :label-for="'selectedPriv' + this.uniqueId"
        class="pb-2"
        invalid-feedback="A privilege level is required" label-cols="3">

        <template v-slot:label>Privilege required:</template>

        <b-form-select style="max-width:500px" v-model="form.ServiceOwner_PrivId" @change="calculateSelectedPrivDetails()" :id="'selectedPriv' + this.uniqueId" size="sm">
          <option value="none" disabled>Please select an option...</option>
          <option value="being-revoked">Revoke access to this service for this role</option>
          <option v-for="servicesAvailablePriv in servicesAvailablePrivs" :key="servicesAvailablePriv.PrivId" :value="servicesAvailablePriv.PrivId">
            {{servicesAvailablePriv.PermissionGroup}}
            <span v-if="servicesAvailablePriv.PrivId === serviceRolePriv.PreviousPriv.PrivId"> - (Previous certification - No change) </span>
            <span v-else> - (New certification) </span>
          </option>
        </b-form-select>
      </b-form-group>

        {{ /* ============ Show details if diff priv required ============ */ }}

      <transition name="fade">
        <b-form-row v-show="selectedPrivIsBeingChanged" class="m-0 mb-3 pb-2">
          <b-col class="p-0" cols="3"><p class="mb-2">{{selectedPrivDetails.PermissionGroup}} Summary:</p></b-col>
          <b-col class="p-0" cols="9"><p class="mb-2">{{selectedPrivDetails.ServicePrivSummary}}</p></b-col>
        </b-form-row>
      </transition>

      {{ /* ===================== Reason for access ====================== */ }}

      <b-form-group
        :state="reasonForAccessState"
        :label-for="'reasonForAccess' + this.uniqueId"
        class="pb-2"
        invalid-feedback="A reason for access is required" label-cols="3">

        <template v-slot:label>Reason for access<span v-if="selectedPrivIsBeingRevoked"> revocation</span>:</template>

        <b-form-textarea
          :disabled="this.form.ServiceOwner_PrivId === 'none'"
          :state="reasonForAccessState"
          :id="'reasonForAccess' + this.uniqueId"
          required
          invalid-feedback="A cycle title is required"
          v-model="form.ServiceOwner_RoleAccessJustification"
          size="sm"
          rows="3"
          class="mh-90"
          @keyup="() => {this.$nextTick(() => {this.reasonForAccessState = this.$refs['servicePrivForm' + this.uniqueId]['reasonForAccess' + this.uniqueId].checkValidity() }) }"
        ></b-form-textarea>

        <b-tooltip :target="'reasonForAccess' + this.uniqueId" triggers="hover" variant="secondary">
          Enter the reason a {{this.serviceRolePriv.RoleName}}<span v-if="selectedPrivIsBeingRevoked"> no longer</span> requires this privilege level on {{this.serviceName}}.
        </b-tooltip>
      </b-form-group>

      {{ /* ======================= Removal Impact ======================== */ }}

      <b-form-group
        :state="impactIfRemovedState"
        :label-for="'impactIfRemoved' + this.uniqueId"
        class="pb-2"
        invalid-feedback="An impact if removed is required" label-cols="3">

        <template v-slot:label>Impact if removed:</template>

        <b-form-textarea
          :disabled="this.form.ServiceOwner_PrivId === 'none'"
          :state="impactIfRemovedState"
          :id="'impactIfRemoved' + this.uniqueId"
          required
          v-model="form.ServiceOwner_RemovalImpact"
          size="sm"
          rows="3"
          class="mh-90"
          @keyup="() => {this.$nextTick(() => {this.impactIfRemovedState = this.$refs['servicePrivForm' + this.uniqueId]['impactIfRemoved' + this.uniqueId].checkValidity() }) }"
          ></b-form-textarea>

        <b-tooltip :target="'impactIfRemoved' + this.uniqueId" triggers="hover" variant="secondary">
          Enter the impact to the {{this.serviceRolePriv.RoleName}} role and the business if the privilege level on {{this.serviceName}} is removed.
        </b-tooltip>
      </b-form-group>

      {{ /* ========================== Tick box ========================== */ }}

      <b-form-row class="m-0">
        <b-col class="mt-1" cols="7" offset-md="3">
          <b-form-checkbox
            :disabled="this.form.RoleOwner_PrivId === 'none'"
            :state="certifiedBoxState"
            required
            :id="'certifiedBox' + this.uniqueId"
            v-model="form.ServiceOwner_IsCertified"
            name="certifiedBox"
            @change="() => {this.$nextTick(() => {this.certifiedBoxState = this.$refs['servicePrivForm' + this.uniqueId]['certifiedBox' + this.uniqueId].checked === true }) }"
          >I hereby certify that the selected level of privilege is the minimum required by the <b>{{this.serviceRolePriv.RoleName}}</b> role for the <b>{{this.serviceName}}</b> service.</b-form-checkbox>
        </b-col>

        <b-col class="text-right" cols="2">
          <b-button :disabled='disableButton' variant="primary" type="submit" class="fs-90">Recertify</b-button>
        </b-col>
      </b-form-row>
    </b-form>
  </div>
</template>

<script>
export default {
  props: ['serviceId', 'serviceName', 'servicesAvailablePrivs', 'serviceRolePriv'],
  data () {
    return {
      form: {
        ServiceOwner_PrivId: 'none',
        ServiceOwner_RoleAccessJustification: null,
        ServiceOwner_RemovalImpact: null,
        ServiceOwner_IsCertified: false,
        ServiceOwner_DateCertified: null
      },
      selectedPrivDetails: [],
      uniqueId: this.serviceRolePriv.RolePrivId,
      reasonForAccessState: null,
      impactIfRemovedState: null,
      certifiedBoxState: null
    }
  },
  created () {
    this.populateForm()
  },
  computed: {
    // Determine if the selected priv is different from the priv certified last time
    selectedPrivIsBeingChanged () {
      return this.form.ServiceOwner_PrivId !== 'none' &&
             this.form.ServiceOwner_PrivId !== 'being-revoked' &&
             this.form.ServiceOwner_PrivId !== this.serviceRolePriv.PreviousPriv.PrivId
    },
    selectedPrivIsBeingRevoked () {
      return this.form.ServiceOwner_PrivId === 'being-revoked'
    },
    // Button should be disable if any of the following return true
    disableButton () {
      return this.form.ServiceOwner_PrivId === 'none' ||
            !this.form.ServiceOwner_RoleAccessJustification ||
            !this.form.ServiceOwner_RemovalImpact ||
            !this.form.ServiceOwner_IsCertified
    }
  },
  methods: {
    // Populate the form if this role has been certified during this recert cycle
    populateForm () {
      if (this.serviceRolePriv.ServiceOwner_IsCertified) {
        if (this.serviceRolePriv.ServiceOwner_IsRevoked) {
            this.form.ServiceOwner_PrivId = 'being-revoked'
        } else {
          this.form.ServiceOwner_PrivId = this.serviceRolePriv.ServiceOwner_PrivId
        }
        this.form.ServiceOwner_RoleAccessJustification = this.serviceRolePriv.ServiceOwner_RoleAccessJustification
        this.form.ServiceOwner_RemovalImpact = this.serviceRolePriv.ServiceOwner_RemovalImpact

        this.calculateSelectedPrivDetails()
      }
    },
    // If a selected priv is different to the previous cycle's certification we need to show its
    // summary below the dropdown box, so calculate the value
    calculateSelectedPrivDetails () {
      if (this.form.ServiceOwner_PrivId !== 'none' && this.form.ServiceOwner_PrivId !== 'being-revoked') {
        this.selectedPrivDetails = this.servicesAvailablePrivs.filter(item => item.PrivId === this.form.ServiceOwner_PrivId)[0]
        this.selectedPrivDetails.ServiceName = this.serviceRolePriv.ServiceName
      }
    },
    submitForm () {
      if (this.form.ServiceOwner_PrivId !== 'none' && this.form.ServiceOwner_IsCertified) {

        let data = {
          roleId: this.serviceRolePriv.RoleId,
          rolePrivId: this.serviceRolePriv.RolePrivId,
          serviceId: this.serviceId,
          formData: {
            ServiceOwner_PrivId: this.form.ServiceOwner_PrivId,
            ServiceOwner_IsRevoked: 0,
            ServiceOwner_RoleAccessJustification: this.form.ServiceOwner_RoleAccessJustification,
            ServiceOwner_RemovalImpact: this.form.ServiceOwner_RemovalImpact,
            ServiceOwner_IsCertified: this.form.ServiceOwner_IsCertified,
            ServiceOwner_DateCertified: this.$currentDateTime()
          }
        }

        // If revoked the PrivId is from existing data and is revoked is true
        if (this.form.ServiceOwner_PrivId === 'being-revoked') {
          data.formData.ServiceOwner_PrivId = this.serviceRolePriv.ServiceOwner_PrivId
          data.formData.ServiceOwner_IsRevoked = 1
        }

        this.$store.dispatch('patchRolePrivXbyServiceOwner', {vm: this, data: data})

        this.$scrollTo('#servicePrivForm' + this.uniqueId)
      }
    }
  },
  watch: {
    serviceRolePriv () {
      this.populateForm()
    }
  }
}
</script>
