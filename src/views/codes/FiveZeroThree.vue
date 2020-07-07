<template>
  <div>
    <div v-if="!loadingState">
      <h2 class="font-weight-normal mt-5 mb-5">Service unavailable</h2>

      <p>The service is currently unavailable for recertification, please try again later.</p>
    </div>

    <div v-else>
      <div id="rbac-spinner-container">
        <div id="rbac-spinner-inner">
          <b-spinner small></b-spinner>
          <strong class="ml-2">Loading...</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState([
      'loadingState'
    ])
  }
}
</script>
