<template>
  <div>
    <h2 class="font-weight-normal mt-5 mb-5">Privileged Access Recertification - Login</h2>

    <p class="pb-3">Please login below.</p>

    {{ /* ================================================================ */ }}
    {{ /*                            FORM BEGINS                           */ }}
    {{ /* ================================================================ */ }}

    <b-form @submit="onSubmit">
      <b-container>

      {{ /* ========================== Username ========================== */ }}

        <b-row align-h="center">
          <b-col cols="6" class="mb-3">
            <p style="color:red!important">This is a placeholder form, please contact the system administrator to emulate authenticated status.</p>

            <b-form-group id="username-label" label="Username:" label-for="username">
              <b-form-input
                id="username"
                v-model="form.username"
                type="email"
                required
                placeholder="Enter your GHA login"
              ></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>

        {{ /* ========================== Password ========================= */ }}

        <b-row align-h="center">
          <b-col cols="6">
            <b-form-group id="password-label" label="Password:" label-for="password">
              <b-form-input
                id="password"
                v-model="form.password"
                type="password"
                required
                placeholder="Enter your GHA password"
              ></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row align-h="center">
          <b-col cols="6" class="text-right">
            <b-button type="submit" variant="primary">Login</b-button>
          </b-col>
        </b-row>
      </b-container>
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
      // console.log("Login button pressed")
    },
  },
  watch: {
  }
}
</script>
