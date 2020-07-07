<template>
  <b-modal
    id="AdminNewCycleNameModal"
    ref="AdminNewCycleNameModal"
    title="Rename current recertification cycle"
    header-bg-variant="primary"
    header-text-variant="light"
    body-bg-variant="light"
    body-text-variant="dark"
    ok-variant="primary"
    ok-title="Rename current cycle"
    footer-bg-variant="light"
    @show="resetForm"
    @hidden="resetForm"
    @ok="submitForm"
  >

    {{ /* ================================================================ */ }}
    {{ /*                            FORM BEGINS                           */ }}
    {{ /* ================================================================ */ }}

    <form ref="form" @submit.stop.prevent="submitForm" validated>

      {{ /* ============================ Name ============================ */ }}

      <b-form-row class="m-0 mb-2">
        <b-col class="mt-1" cols="12">
          <b-form-group
            :state="recertNewCycleTitleState"
            label="New cycle title (displayed to users of this application)"
            label-for="title-input-name"
            invalid-feedback="New title is required"
          >
            <b-form-input
              id="RecertNewCycleTitleId"
              name="title-input-name"
              v-model="form.RecertNewCycleTitle"
              :state="recertNewCycleTitleState"
              @keyup="() => {this.$nextTick(() => {this.recertNewCycleTitleState = this.$refs.form.RecertNewCycleTitleId.checkValidity() }) }"
              required
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>
    </form>

    <template v-slot:modal-footer="{ ok, cancel }">
      <b-btn size="sm" :disabled="isNewTitleEntered" variant="primary" @click="ok()">
        OK
      </b-btn>
      <b-btn size="sm" variant="secondary" @click="cancel()">
        Cancel
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
        RecertNewCycleTitle: ''
      },
      recertNewCycleTitleState: null,
    }
  },
  computed: {
    isNewTitleEntered () {
      return this.recertNewCycleTitleState == null
    }
  },
  methods: {
    resetForm() {
      this.form.RecertNewCycleTitle = ''
      this.recertNewCycleTitleState = null
    },
    submitForm () {
      if (this.$refs.form.checkValidity()) {
        // Keeping the same data format as patch for consistencies sake
        let data = {
          RecertCycleId: this.currentRecertCycleId,
          formData: {
            RecertCycleTitle: this.form.RecertNewCycleTitle
          }
        }

        this.$store.dispatch('patchRecertCycle', {vm: this, data: data})
      }
    }
  }
}
</script>

<style scoped>

</style>
