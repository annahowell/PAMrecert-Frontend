<template>
  <div>
    <b-form v-on:submit.prevent="submitForm">
      <b-form-row>
        <b-col cols="7">
          <b-form-select v-model="form.RoleId" size="sm">
            <option v-for="role in myRoles" :key="role.RoleId" :value="role.RoleId">
              {{role.RoleName}}
            </option>
          </b-form-select>
        </b-col>
        <b-col cols="5" class="text-right">
          <b-btn
            size="sm"
            variant="primary"
            style="width:100px!important"
            aria-hidden="true"
            type="submit"
            :disabled="isDisabled"
            >Update Role
          </b-btn>
        </b-col>
      </b-form-row>
    </b-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: ['rowItem'],
  data () {
    return {
      form: {
        RoleId: this.rowItem.RoleId
      },
    }
  },
  computed: {
    isDisabled () {
      // Button is disabled if the RoleId is unchanged
      return this.rowItem.RoleId === this.form.RoleId
    },
    ...mapState([
      'myRoles'
    ])
  },
  methods: {
    submitForm () {
        let data = {
          userId: this.rowItem.UserId,
          formData: {
            RoleId: this.form.RoleId,
            LastCertifiedBy: this.$store.state.account.userId,
            LastCertifiedDate:  this.$currentDateTime()
          }
        }

        this.$store.dispatch('patchUserX', {vm: this, data: data})
    }
  },
  watch: {
    rowItem () {
      this.form.RoleId = this.rowItem.RoleId
    }
  }
}
</script>
