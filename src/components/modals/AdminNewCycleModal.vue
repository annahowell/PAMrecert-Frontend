<template>
  <b-modal
    id="AdminNewCycleModal"
    ref="AdminNewCycleModal"
    title="Begin new recertification cycle"
    header-bg-variant="danger"
    header-text-variant="light"
    body-bg-variant="light"
    body-text-variant="dark"
    @show="resetForm"
    @hidden="resetForm"
  >

    {{ /* ================================================================ */ }}
    {{ /*                            FORM BEGINS                           */ }}
    {{ /* ================================================================ */ }}

    <form ref="newCycleForm" @submit.stop.prevent="submitForm" validated>

      {{ /* =========================== Title ============================ */ }}

      <b-form-row class="m-0 mb-2">
        <b-col class="mt-1" cols="12">
          <b-form-group
            :state="recertCycleTitleState"
            label="New cycle title (displayed to users of this application)"
            label-for="title-input-name"
            invalid-feedback="A cycle title is required"
          >
            <b-form-input
              id="RecertCycleTitleId"
              name="title-input-name"
              v-model="form.RecertCycleTitle"
              :state="recertCycleTitleState"
              @keyup="() => {this.$nextTick(() => {this.recertCycleTitleState = this.$refs.newCycleForm.RecertCycleTitleId.checkValidity() }) }"
              required
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>

      {{ /* ========================= Enabled state ====================== */ }}

      <b-form-row class="m-0 mb-2">
        <b-col class="mt-1" cols="12">
          <b-form-group
            :state="recertEnabledState"
            label="Allow service owners and role owners to begin recertification immediately?"
            label-for="recert-enabled-input"
            invalid-feedback="A choice is required"
          >
            <b-form-radio-group
              v-model="form.RecertEnabled"
              :state="recertEnabledState"
              required
              @change="() => {this.$nextTick(() => {this.recertEnabledState = this.form.RecertEnabled !== null }) }"
            >
              <b-form-radio name="recert-enabled-input" value="true">Yes</b-form-radio>
              <b-form-radio name="recert-enabled-input" value="false">No</b-form-radio>
            </b-form-radio-group>
          </b-form-group>
        </b-col>
      </b-form-row>
    </form>

    <template v-slot:modal-footer="{ cancel }">
      <b-btn size="sm" variant="secondary" @click="cancel()">
        Cancel
      </b-btn>
      <b-btn size="sm" variant="danger" @click="submitForm()">
        Begin new cycle
      </b-btn>
    </template>
  </b-modal>
</template>

<script>
export default {
  props: ['currentRecertCycleId'],
  data() {
    return {
      form: {
        RecertCycleTitle: '',
        RecertEnabled: null
      },
      name: '',
      recertCycleTitleState: null,
      recertEnabledState: null,
      submittedNames: []
    }
  },
  methods: {
    resetForm() {
      this.form.RecertCycleTitle = ''
      this.form.RecertEnabled = null
      this.recertCycleTitleState = null
      this.recertEnabledState = null
    },
    submitForm () {
      this.recertCycleTitleState = this.$refs.newCycleForm.RecertCycleTitleId.checkValidity()
      this.recertEnabledState = this.form.RecertEnabled !== null

      if (this.recertCycleTitleState && this.recertEnabledState) {

        // Keeping the same data format as patch for consistencies sake
        let data = {
          formData: {
            // DateTimes for end of old cycle and start of new cycle are done automatically
            // by the API so we just need the new title and if it's enabled or not
            RecertCycleTitle: this.form.RecertCycleTitle,
            RecertEnabled: this.form.RecertEnabled
          }
        }

        this.$store.dispatch('postNewRecertCycle', {vm: this, data: data})

        this.$bvModal.hide('AdminNewCycleModal')
      }
    }
  }
}
</script>
