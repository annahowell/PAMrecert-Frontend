{{ /* ================================================================ */ }}
{{ /*                         Reusable Modal base                      */ }}
{{ /* ================================================================ */ }}
<template>
  <b-modal
    id="RolePrivDetailsModal"
    ref="RolePrivDetailsModal"
    header-bg-variant="primary"
    header-text-variant="light"
    body-bg-variant="light"
    body-text-variant="dark"
    hide-footer
    scrollable
    size="lg"
    :title="fullTitle"
    >
    <b-card>
      <pre class="fs-85">{{modalContent.ServicePrivLevel}}</pre>
    </b-card>
  </b-modal>
</template>

<script>
export default {
  props: ['modalContent'],
  computed: {
    fullTitle: function () {
      return this.modalContent.PermissionGroup + ' Privilege Details for ' + this.modalContent.ServiceName
    }
  }
}
</script>
