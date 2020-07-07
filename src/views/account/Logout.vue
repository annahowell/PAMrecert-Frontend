<template>
  <div>
    <h2 class="font-weight-normal mt-5 mb-5">Privileged Access Recertification - Logout</h2>

    <p class="pb-3">Are you sure you wish to log out?</p>

    <b-form @submit="onSubmit">
      <p style="color:red!important">This is a placeholder logout button, please contact the system administrator to emulate non-authenticated status.</p>

      <b-button type="submit" variant="primary">Logout</b-button>
    </b-form>
  </div>
</template>

<script>
export default {
  components: {
  },
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
    }
  },
  mounted () {
  },
  created () {
  },
  computed: {
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault()
      // console.log("Logout button pressed")
    },
  },
  watch: {
  }
}
</script>
