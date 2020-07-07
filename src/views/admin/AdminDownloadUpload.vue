<template>
  <div>
    <h2 class="font-weight-normal mt-5 mb-5">Admin - Upload / Download <span style="text-transform:lowercase!important">.csv</span> Files</h2>

    <p class="pb-0">Use the download and upload buttons on the tabs below to download or upload .csv files directly from and to the database. To perform mass amendments, download a file, alter the data therein and then upload it using the overwrite option.</p>

    <div class="text-right">
      <b-button variant="primary" @click="toggleuploadHelpCollapsed()" size="sm">
        <span v-if="this.uploadHelpCollapsed">Show</span><span v-else>Hide</span> additional information
      </b-button>
    </div>

    <b-collapse id="uploadHelpCollapse">
      <b-alert class="mt-4 mb-4 fs-90" variant="warning" show>
        <p>The format of the underlying database has rules which must be adhered to when uploading data. Amongst other things the rules form a hierarchy, for example you can't delete a <i>ServiceId</i> in the <i>ServiceTable</i> if there is a privilege in the <i>PrivTable</i> assigned to that <i>ServiceId</i>.
           Similarly you can't delete a <i>PrivId</i> in the <i>PrivTable</i> if a <i>RoleOwner_PrivId</i> or <i>ServiceOwner_PrivId</i> in <i>RolePrivLink</i> is assigned to the <i>PrivId</i>. <i>RolePrivLink</i> is therefore at the top of the hierarchy, because it relies on other data, but nothing in the database relies on it.
           <i>UserTable</i> is also at the top of the hierarchy because it relies on data in the <i>RoleTable</i> but nothing has reliance on its data.</p>
        <p>It can thus be understood that the database has a hierarchy of data reliance, the complete hierachy is as follows:</p>


        <b-table class="upload_help fs-90" borderless outlined striped variant="warning" :items="hierarchy_items" :fields="hierarchy_fields" style="max-width:420px!important">
          <template v-slot:cell(relies_on)="data">
            <span v-html="data.value"></span>
          </template>

          <template v-slot:cell(relied_on_by)="data">
            <span v-html="data.value"></span>
          </template>
        </b-table>

        <p>When initially 'seeding' the database, the <i>RoleTable</i> must be uploaded first because it's at the bottom of the hierarchy and thus not reliant on other components. This is followed by <i>ServiceTable</i>, then <i>PrivTable</i> and finally <i>RolePrivLink</i>. You have the option to upload <i>UserTable</i> at any time after uploading <i>RoleTable</i>, as it only relies on data in <i>RoleTable</i>.</p>

        <p class="mb-0">For more granular details of the rules that apply to each database component, see the 'additional rules' column in the upload tab table. To help visualise how the components are linked together, an image of the underlying database structure can be viewed below.</p>
      </b-alert>

      <b-img class="mt-4 mb-4" src="/img/db-structure.png" fluid-grow alt="Database structure"></b-img>
    </b-collapse>

    <b-tabs v-model="csvTabCurrentlyOpen" class="mt-4">

      {{ /* ======================= Download table ======================= */ }}

      <b-tab title="Download">
        <b-table
          striped
          borderless
          outlined
          head-variant="light"
          class="fs-90 border-top-0 csv"
          :fields="downloadFields"
          :items="downloadItems"
          :busy="loadingState"
          show-empty>

          <template v-slot:cell(tableName)="data">
            <span v-html="data.value"></span>&nbsp;&nbsp;&nbsp; <!-- Make space for the header -->
          </template>

          <template v-slot:cell(DownloadButton)="row">
            <b-button
              class="mr-1"
              size="sm"
              variant="primary"
              aria-hidden="true"
              @click="handleCsvDownload(row.item.url, row.item.tableName)"
              >Download
            </b-button>
          </template>

          <template v-slot:table-busy>
            <div class="text-center mt-5 mb-5">
              <b-spinner small class="align-middle"></b-spinner>
              <strong class="ml-2">Loading...</strong>
            </div>
          </template>
        </b-table>
      </b-tab>

      {{ /* ======================= Upload table ========================= */ }}

      <b-tab title="Upload">
        <div v-if="!currentRecertCycle.RecertEnabled">
          <b-table
            striped
            borderless
            outlined
            head-variant="light"
            class="fs-90 border-top-0 border-bottom-0 mb-0 csv"
            :fields="uploadFields"
            :items="uploadItems"
            :busy="loadingState"
            show-empty>

            <template v-slot:cell(tableInfo)="data">
              <span v-html="data.value"></span>
            </template>

            <template v-slot:cell(tableRules)="data">
              <span v-html="data.value"></span>
            </template>

            <template v-slot:cell(UploadSelection)="row">
              <b-form-radio v-model="uploadUrlTarget" name="uploadUrlTargetRadio" :value="row.item.url" inline></b-form-radio>

            </template>

            <template v-slot:table-busy>
              <div class="text-center mt-5 mb-5">
                <b-spinner small class="align-middle"></b-spinner>
                <strong class="ml-2">Loading...</strong>
              </div>
            </template>
          </b-table>

          <b-row v-if="!loadingState">
            <b-col cols="12">
              <div class="border border-top-0 pt-3">

                <b-row>
                  <b-col cols="7">
                    <b-form-group class="fs-90 pt-3 pb-3 pl-3 pr-2 mt-0" :disabled="uploadUrlTarget == ''">
                      Uploaded .csv should:
                      <b-form-radio v-model="deleteAndReplace" name="deleteAndReplaceRadio" value="false" class="ml-2" inline>create and update</b-form-radio>
                      <b-form-radio v-model="deleteAndReplace" name="deleteAndReplaceRadio" value="true" inline>entirely replace existing data</b-form-radio>
                    </b-form-group>
                  </b-col>

                  <b-col cols="3">
                    <div class="p-3">
                      <b-form-file accept="text/csv" :disabled="uploadUrlTarget == ''" v-model="file" size="sm"></b-form-file>
                    </div>
                  </b-col>

                  <b-col cols="2">
                    <div class="pt-3 pr-3 pb-3 pl-0 text-right">
                      <b-button
                        :disabled="uploadUrlTarget == '' || uploadUrlTarget == '' || file == null"
                        size="sm"
                        variant="primary"
                        aria-hidden="true"
                        @click="handleCsvUpload()"
                        >Upload
                      </b-button>
                    </div>
                  </b-col>
                </b-row>
              </div>
            </b-col>
          </b-row>
        </div>

        <div v-else>
          <p class="m-4">To upload .csv files the current recertification cycle must be disabled.</p>
          <div class="text-center">
            <b-button variant="primary" href="#" :to="{name: 'admin'}" size="sm">Go to Admin page</b-button>
          </div>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {
      csvTabCurrentlyOpen: 0,
      uploadHelpCollapsed: true,

      uploadUrlTarget: '',
      deleteAndReplace: '',
      file: null,

      hierarchy_fields: [
        {key: 'table', label: '', sortable: false, isRowHeader: true, class: 'align-middle'},
        {key: 'relies_on', label: 'Relies on', sortable: false, class: 'align-middle'},
        {key: 'relied_on_by', label: 'Is relied on by', sortable: false, class: 'align-middle'},
        {key: 'hierarchy', label: 'Hierarchy', sortable: false, class: 'align-middle'}
      ],
      hierarchy_items: [
        {isActive: true, table: 'RoleTable', relies_on: 'Nothing', relied_on_by: 'UserTable<br>ServiceTable<br>RolePrivLink', hierarchy: 'Bottom'},
        {isActive: false, table: 'ServiceTable', relies_on: 'RoleTable', relied_on_by: 'PrivTable', hierarchy: 'Middle lower'},
        {isActive: true, table: 'PrivTable', relies_on: 'ServiceTable', relied_on_by: 'RolePrivLink', hierarchy: 'Middle upper'},
        {isActive: true, table: 'RolePrivLink', relies_on: 'RoleTable<br>PrivTable', relied_on_by: 'Nothing', hierarchy: 'Top'},
        {isActive: false, table: 'UserTable', relies_on: 'RoleTable', relied_on_by: 'Nothing', hierarchy: 'Top'}
      ],

      downloadFields: [
        {key: 'tableName', label: 'Export from', class: 'align-middle'},
        {key: 'tableInfo', label: 'Resulting .csv should contain', class: 'align-middle'},
        {key: 'DownloadButton', label: '', tdClass: 'align-middle text-right'}
      ],
      downloadItems: [
        {tableName: 'RoleTable', url: 'role\\tablecsv', tableInfo: 'Role data including the owner of the role'},
        {tableName: 'ServiceTable', url: 'service\\tablecsv', tableInfo: 'Service data including which role owns the service'},
        {tableName: 'PrivTable', url: 'priv\\tablecsv', tableInfo: 'Privilege data including the service to which the privilege belongs'},
        {tableName: 'RolePrivLink', url: 'role\\privlinkcsv', tableInfo: 'The relationship between a role and a privilege as certified by the Service Owner and the Role Owner, this includes any revocation, access justification, removal impact and date certified. Also holds the risk assessment impact, likelihood, notes and date assessed as submitted by admins'},
        {tableName: 'UserTable', url: 'user\\tablecsv', tableInfo: 'User data including what the user’s role is and when the role was last certified'}
      ],

      uploadFields: [
        {key: 'tableName', label: 'Uploads to', class: 'align-middle'},
        {key: 'tableInfo', label: '.csv must contain', class: 'align-middle'},
        {key: 'tableRules', label: 'Additional rules', class: 'align-middle'},
        {key: 'UploadSelection', label: 'Select', tdClass: 'align-middle text-right'}
      ],
      uploadItems: [
        {
          tableName:  'RoleTable', url: 'role\\tablecsv', tableInfo: '<div class="contains"><p>RoleId</p><p>RoleName</p><p>RoleOwner_RoleId</p></div>',
          tableRules: `&#8729; <i>RoleId</i> must be unique.<br>
                       &#8729; <i>RoleId</i> should not contain spaces or special characters.<br>
                       &#8729; Amending a <i>RoleId</i> will automatically update any linked <i>RoleId&#39;s</i> in <i>UserTable</i>, <i>ServiceTable</i> and <i>RolePrivLink</i>.<br>
                       &#8729; Deletion of entries is possible if the <i>RoleId</i> is not present in the <i>UserTable</i>, <i>ServiceTable</i> or <i>RolePrivLink</i>.<br>
                       <div class="rule_hack"></div>
                       &#8729; <i>RoleOwner_RoleId</i> can be zero characters if the role has no owner (e.g. CEO).<br>
                       &#8729; If the role has an owner the <i>RoleOwner_RoleId&#39;s</i> linked <i>RoleId</i> should eventually exist in the <i>RoleTable</i>.`
        },
        {
          tableName:  'ServiceTable', url: 'service\\tablecsv', tableInfo: '<div class="contains"><p>ServiceId</p><p>ServiceName</p><p>ServiceOwner_RoleId</p></div>',
          tableRules: `&#8729; <i>ServiceId</i> must be unique.<br>
                       &#8729; <i>ServiceId</i> should not contain spaces or special characters.<br>
                       &#8729; Amending a <i>ServiceId</i> will automatically update any linked <i>ServiceId&#39;s</i> in </>PrivTable</i>.<br>
                       &#8729; Deletion of entries is possible if the <i>ServiceId</i> is not present in the <i>PrivTable</i>.<br>
                       <div class="rule_hack"></div>
                       &#8729; <i>ServiceOwner_RoleId&#39;s</i> linked <i>RoleId</i> must already exist in the <i>RoleTable</i>.`
        },
        {
          tableName:  'PrivTable', url: 'priv\\tablecsv', tableInfo: '<div class="contains"><p>PrivId</p><p>ServiceId</p><p>ServicePrivSummary</p><p>PermissionGroup</p></div>',
          tableRules: `&#8729; <i>PrivId</i> must be unique.<br>
                       &#8729; <i>PrivId</i> should not contain spaces or special characters.<br>
                       &#8729; Amending a <i>PrivId</i> is not recommended as it will not automatically update any linked <i>RoleOwner_PrivId</i> or <i>ServiceOwner_PrivId</i> in <i>RolePrivLink</i>. Therefore associated entries in <i>RolePrivLink</i> must be amended manually, failing to correctly amend them will cause unexpected behavour.<br>
                       &#8729; Deletion of entries is possible if the <i>PrivId</i> is not present in <i>RolePrivLink</i>.<br>
                       <div class="rule_hack"></div>
                       &#8729; <i>ServiceId&#39;s</i> linked <i>ServiceId</i> must already exist in the <i>ServiceTable</i>.`
        },
        {
          tableName:  'RolePrivLink', url: 'role\\privlinkcsv', tableInfo: '<div class="contains"><p>RoleId</p><p>RoleOwner_PrivId</p><p>ServiceOwner_PrivId</p></div>',
          tableRules: `&#8729; <i>RolePrivId</i> must not be included as it is generated automatically.<br>
                       &#8729; Deletion of entries is possible at any time.<br>
                       <div class="rule_hack"></div>
                       &#8729; <i>RoleOwner_RoleId&#39;s</i> linked <i>RoleId</i> must already exist in the <i>RoleTable</i>.<br>
                       <div class="rule_hack"></div>
                       &#8729; <i>RoleOwner_PrivId&#39;s</i> linked <i>PrivId</i> must already exist in the <i>PrivTable</i> when a new value is submitted.<br>
                       &#8729; When combined together a <i>RoleId</i> and <i>RoleOwner_PrivId</i> must form a unique combination.<br>
                       <div class="rule_hack"></div>
                       &#8729; <i>ServiceOwner_PrivId&#39;s</i> linked <i>PrivId</i> must already exist in the <i>PrivTable</i> when a new value is submitted.<br>
                       &#8729; When combined together a <i>RoleId</i> and <i>ServiceOwner_PrivId</i> must form a unique combination.`
        },
        {
          tableName:  'UserTable', url: 'user\\tablecsv', tableInfo: '<div class="contains"><p>UserId</p><p>UserFullName</p><p>RoleOwner_UserId</p><p>RoleId</p></div>',
          tableRules: `&#8729; <i>UserId</i> must be unique.<br>
                       &#8729; <i>UserId</i> should not contain spaces or special characters.<br>
                       &#8729; Deletion of entries  is possible at any time.<br>
                       <div class="rule_hack"></div>
                       &#8729; <i>RoleId&#39;s</i> linked <i>RoleId</i> must already exist in the <i>RoleTable</i>.`
        }
      ]
    }
  },
  created () {
    this.$store.dispatch("getCurrentRecertCycle", {startLoading: true, endLoading: true})

  },
  computed: {
    ...mapState([
      'loadingState',
      'currentRecertCycle'
    ])
  },
  methods: {
    toggleuploadHelpCollapsed () {
      this.uploadHelpCollapsed = !this.uploadHelpCollapsed
      this.$root.$emit('bv::toggle::collapse', 'uploadHelpCollapse')
    },
    handleCsvDownload (url, tableName) {
      this.$store.dispatch('getCsv', {vm: this, url: url, tableName: tableName})
    },
    handleCsvUpload(){
      let formData = new FormData()

      formData.append('DeleteAndReplace', this.deleteAndReplace);
      formData.append('File', this.file);

      this.$store.dispatch('postCsv', {vm: this, url: this.uploadUrlTarget, formData: formData})

      // Force user to choose the file each time they click upload
      this.file = null
    },
  },
  watch: {
    currentRecertCycle () {
      if (this.currentRecertCycle.RecertCount === 1) {
        this.csvTabCurrentlyOpen = 1
      }
    }
  }
}
</script>

<style>
.table.csv td {
    padding: 1rem 0.5rem 1rem 0.75rem !important;
}

table.upload_help thead {
  background-color: #E6DAB4!important;
}

table.upload_help th,
table.upload_help td {
    padding: 0.4rem!important;
}

.contains p {
  margin-bottom: 7px!important
}

.rule_hack {
  height:9px!important
}
</style>
