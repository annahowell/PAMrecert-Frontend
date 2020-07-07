<template>
  <div>
    <b-row>
      <b-col cols="12" class="mb-1">

        <p>You are recertifying the privilege a <b>{{this.roleName}}</b> role has on the <b>{{roleServicePriv.ServiceName}}</b> service.</p>

        <b-alert v-if="this.roleServicePriv.RoleOwner_IsCertified" variant="warning" class="text-center mt-4 mb-4" show>
          The privilege level of the service for this role has already been certified during the current recertification cycle. You may amend your certification using the <b-link v-scroll-to="'#rolePrivForm' + this.uniqueId">form</b-link> below.
        </b-alert>

        <p v-if="roleServicePriv.PreviousPriv != null">During the last certification cycle, the '<b>{{roleServicePriv.PreviousPriv.PermissionGroup}}</b>' privilege level was certified for use by this role.
        If you choose to retain this privilege level, you must still complete the '<i>reason for access</i>' and '<i>impact if removed</i>' fields.</p>
      </b-col>
    </b-row>

    <b-row v-if="roleServicePriv.PreviousPriv != null">
      <b-col cols="12"><p class="mt-3 mb-0">{{roleServicePriv.PreviousPriv.PermissionGroup}} Privilege Summary:</p></b-col>
      <b-col cols="12"><p>{{roleServicePriv.PreviousPriv.ServicePrivSummary}}</p></b-col>
    </b-row>

    <b-row style="margin:3rem 0 1.25rem">
      <b-col class="p-0">
        <div class="separator">Recertify {{this.roleName}} privilege level for {{roleServicePriv.ServiceName}}</div>
      </b-col>
    </b-row>

    {{ /* ================================================================ */ }}
    {{ /*                            FORM BEGINS                           */ }}
    {{ /* ================================================================ */ }}

    <b-form :id="'rolePrivForm' + this.uniqueId" :ref="'rolePrivForm' + this.uniqueId" v-on:submit.prevent="submitForm">

      {{ /* ======================== Select box ========================== */ }}

      <b-form-group
        :label-for="'selectedPriv' + this.uniqueId"
        class="pb-2"
        invalid-feedback="A privilege level is required" label-cols="3">

        <template v-slot:label>Privilege required:</template>

        <b-form-select style="max-width:500px" v-model="form.RoleOwner_PrivId" @change="calculateSelectedPrivDetails()" :id="'selectedPriv' + this.uniqueId" size="sm">
          <option value="none" disabled>Please select an option...</option>
          <option value="being-revoked">Revoke access to this service for this role</option>
          <option v-for="servicesAvailablePriv in roleServicePriv.ServicesAvailablePrivs" :key="servicesAvailablePriv.PrivId" :value="servicesAvailablePriv.PrivId">
            {{servicesAvailablePriv.PermissionGroup}}
            <span v-if="roleServicePriv.PreviousPriv != null && servicesAvailablePriv.PrivId === roleServicePriv.PreviousPriv.PrivId">&nbsp;&nbsp;&nbsp;(Selected during last recert cycle)</span>
          </option>
        </b-form-select>
      </b-form-group>

      {{ /* ============= Show details if diff priv required ============= */ }}

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
          :disabled="this.form.RoleOwner_PrivId === 'none'"
          :state="reasonForAccessState"
          :id="'reasonForAccess' + this.uniqueId"
          required
          invalid-feedback="A cycle title is required"
          v-model="form.RoleOwner_RoleAccessJustification"
          size="sm"
          rows="3"
          class="mh-90"
          @keyup="() => {this.$nextTick(() => {this.reasonForAccessState = this.$refs['rolePrivForm' + this.uniqueId]['reasonForAccess' + this.uniqueId].checkValidity() }) }"
        ></b-form-textarea>

        <b-tooltip :target="'reasonForAccess' + this.uniqueId" triggers="hover" variant="secondary">
          Enter the reason a {{this.roleName}}<span v-if="selectedPrivIsBeingRevoked"> no longer</span> requires this privilege level on {{this.roleServicePriv.ServiceName}}.
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
          :disabled="this.form.RoleOwner_PrivId === 'none'"
          :state="impactIfRemovedState"
          :id="'impactIfRemoved' + this.uniqueId"
          required
          v-model="form.RoleOwner_RemovalImpact"
          size="sm"
          rows="3"
          class="mh-90"
          @keyup="() => {this.$nextTick(() => {this.impactIfRemovedState = this.$refs['rolePrivForm' + this.uniqueId]['impactIfRemoved' + this.uniqueId].checkValidity() }) }"
          ></b-form-textarea>

        <b-tooltip :target="'impactIfRemoved' + this.uniqueId" triggers="hover" variant="secondary">
          Enter the impact to the {{this.roleName}} role and the business if the privilege level on {{this.roleServicePriv.ServiceName}} is removed.
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
            v-model="form.RoleOwner_IsCertified"
            name="certifiedBox"
            @change="() => {this.$nextTick(() => {this.certifiedBoxState = this.$refs['rolePrivForm' + this.uniqueId]['certifiedBox' + this.uniqueId].checked === true }) }"
          >I hereby certify that the selected level of privilege is the minimum required by the <b>{{this.roleName}}</b> role for the <b>{{this.roleServicePriv.ServiceName}}</b> service.</b-form-checkbox>
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
  props: ['roleId', 'roleName', 'roleServicePriv'],
  data () {
    return {
      form: {
        RoleOwner_PrivId: 'none',
        RoleOwner_RoleAccessJustification: null,
        RoleOwner_RemovalImpact: null,
        RoleOwner_IsCertified: false,
        RoleOwner_DateCertified: null
      },
      selectedPrivDetails: [],
      uniqueId: this.roleServicePriv.RolePrivId,
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
      return this.form.RoleOwner_PrivId !== 'none' &&
             this.form.RoleOwner_PrivId !== 'being-revoked' &&
             this.form.RoleOwner_PrivId !== this.roleServicePriv.PreviousPriv.PrivId
    },
    selectedPrivIsBeingRevoked () {
      return this.form.RoleOwner_PrivId === 'being-revoked'
    },
    // Button should be disabled if any of the following return true
    disableButton () {
      return this.form.RoleOwner_PrivId === 'none' ||
            !this.form.RoleOwner_RoleAccessJustification ||
            !this.form.RoleOwner_RemovalImpact ||
            !this.form.RoleOwner_IsCertified
    }
  },
  methods: {
    // Populate the form if this role has been certified during this recert cycle
    populateForm () {
      if (this.roleServicePriv.RoleOwner_IsCertified) {
        if (this.roleServicePriv.RoleOwner_IsRevoked) {
            this.form.RoleOwner_PrivId = 'being-revoked'
        } else {
          this.form.RoleOwner_PrivId = this.roleServicePriv.RoleOwner_PrivId
        }
        this.form.RoleOwner_RoleAccessJustification = this.roleServicePriv.RoleOwner_RoleAccessJustification
        this.form.RoleOwner_RemovalImpact = this.roleServicePriv.RoleOwner_RemovalImpact

        this.calculateSelectedPrivDetails()
      }
    },
    // If a selected priv is different to the previous cycle's certification we need to show its
    // summary below the dropdown box, so calculate the value
    calculateSelectedPrivDetails () {
      if (this.form.RoleOwner_PrivId !== 'none' && this.form.RoleOwner_PrivId !== 'being-revoked') {
        this.selectedPrivDetails = this.roleServicePriv.ServicesAvailablePrivs.filter(item => item.PrivId === this.form.RoleOwner_PrivId)[0]
        this.selectedPrivDetails.ServiceName = this.roleServicePriv.ServiceName
      }
    },
    submitForm () {
      if (this.form.RoleOwner_PrivId !== 'none' && this.form.RoleOwner_IsCertified) {

        let data = {
          roleId: this.roleId,
          rolePrivId: this.roleServicePriv.RolePrivId,
          formData: {
            RoleOwner_PrivId: this.form.RoleOwner_PrivId,
            RoleOwner_IsRevoked: 0,
            RoleOwner_RoleAccessJustification: this.form.RoleOwner_RoleAccessJustification,
            RoleOwner_RemovalImpact: this.form.RoleOwner_RemovalImpact,
            RoleOwner_IsCertified: this.form.RoleOwner_IsCertified,
            RoleOwner_DateCertified: this.$currentDateTime()
          }
        }

        // If revoked the PrivId is from existing data and is revoked is true
        if (this.form.RoleOwner_PrivId === 'being-revoked') {
          data.formData.RoleOwner_PrivId = this.roleServicePriv.RoleOwner_PrivId
          data.formData.RoleOwner_IsRevoked = 1
        }
        this.$store.dispatch('patchRolePrivXbyRoleOwner', {vm: this, data: data})

        this.$scrollTo('#rolePrivForm' + this.uniqueId)
      }
    }
  },
  watch: {
    roleServicePriv () {
      this.populateForm()
    }
  }
}
</script>
