<template>
  <div class="table-panel-container">
    <div class="header">
      <div>
        <span>Select Range</span>
        <div class="date-picker-container">
          <DatePicker v-model="range" mode="dateTime" :masks="masks" is-range>
            <template v-slot="{ inputValue, inputEvents }">
              <div class="template">
                <div class="input-container">
                  <svg
                    class="calendar-icon"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <input :value="inputValue.start" v-on="inputEvents.start" class="input-field" />
                </div>
                <div class="input-container">
                  <svg
                    class="calendar-icon"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <input :value="inputValue.end" v-on="inputEvents.end" class="input-field" />
                </div>
              </div>
            </template>
          </DatePicker>
          <button @click="handleLoad" class="update-button">Update</button>
        </div>
      </div>
    </div>
    <div v-show="loadingData" id="circle">
      <div class="loader"></div>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th v-for="columnName in Object.keys(schema)" :key="columnName">{{ columnName }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in logsToShow" :key="index">
            <td v-for="field in Object.keys(schema)" :key="field">{{ log[field] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="panel-footer">
      <div class="panel-pagination-container" :aria-disabled="pageCount <= 1">
        <button class="pagination-button" @click="currentPage--" :disabled="currentPage == 0">
          <i class="fas fa-angle-left fa-lg"></i>
        </button>
        <div class="page-counter">{{ currentPage + 1 }} from {{ pageCount }}</div>
        <button class="pagination-button" @click="currentPage++" :disabled="currentPage == pageCount - 1">
          <i class="fas fa-angle-right fa-lg"></i>
        </button>
        <div>
          Rows:
          <select v-model="rowLimit" @change="handleRowChange">
            <option v-for="rows in rowsToShow" :key="rows" :value="rows">{{ rows }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from 'v-calendar/lib/components/date-picker.umd';
export default {
  components: {
    DatePicker,
  },
  data() {
    return {
      range: {
        start: new Date(),
        end: new Date(),
      },
      masks: {
        input: 'YYYY-MM-DD h:mm A',
      },
      searchField: '',
      currentPage: 0,
      rowLimit: 10,
      rowsToShow: [5, 10, 15, 20],
      auditLogs: [],
      loadingData: false,
      schema: [],
      otlRequest: 'otstats index=driverlog | sort -_time',
      ttl: 60,
    };
  },
  computed: {
    pageCount() {
      return this.auditLogs.length ? Math.ceil(this.auditLogs.length / this.rowLimit) : 1;
    },
    logsToShow() {
      return this.auditLogs.slice(this.currentPage * this.rowLimit, (this.currentPage + 1) * this.rowLimit);
    },
  },
  methods: {
    timestampToDateString(timestamp) {
      return timestamp ? new Date(timestamp * 1000).toUTCString() : '';
    },
    handleRowChange() {
      this.currentPage = 0;
    },
    async handleLoad() {
      this.schema = [];
      this.auditLogs = [];
      this.currentPage = 0;
      this.loadingData = true;
      const ds = await this.$root.dataSourceSystem.createDataSource({
        cache_ttl: this.ttl,
        original_otl: this.otlRequest,
        twf: Date.parse(this.range.end) / 1000,
        tws: Date.parse(this.range.start) / 1000,
        type: 'OTL',
      });
      const rows = await ds.getRows();
      this.schema = await ds.getSchema();
      this.auditLogs = rows.toArray();
      this.loadingData = false;

      //
      // setTimeout(() => {
      //   let logs = this.getLogs();
      //   if (this.from && this.to) {
      //     const from = Date.parse(this.from);
      //     const to = Date.parse(this.to);
      //     logs = logs.filter(log => log.timestamp * 1000 >= from && log.timestamp * 1000 <= to);
      //   }
      //   if (this.searchField) {
      //     const searchPhrase = this.searchField.toLowerCase();
      //     logs = logs.filter(
      //       log =>
      //         log.username.toLowerCase().includes(searchPhrase) ||
      //         log.message.toLowerCase().includes(searchPhrase) ||
      //         log.pluginName.toLowerCase().includes(searchPhrase)
      //     );
      //   }
      //   this.auditLogs = logs;
      //
      // }, 2000);
    },
  },
};
</script>

<style scoped>
.table-panel-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  padding: 10px 20px;
}
.input-container {
  position: relative;
  margin: 5px;
}
.calendar-icon {
  position: absolute;
  width: 1rem;
  margin: 8px;
}
.template {
  display: flex;
}
.table-container {
  height: 100%;
  overflow-x: auto;
  border-bottom: 1px solid #ccc;
}

.date-picker-container {
  display: flex;
  align-items: center;
}
.input-field {
  background-color: #f7fafc;
  border-width: 1px;
  border-radius: 5px;
  padding: 8px 0 8px 25px;
  font-size: 100%;
  border: 1px solid #e2e8f0;
}
.update-button {
  width: 65px;
  height: 35px;
}
#circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  z-index: 1000;
}
.loader {
  width: calc(100% - 0px);
  height: calc(100% - 0px);
  border: 8px solid #e0f2f1;
  border-top: 8px solid #009688;
  border-radius: 50%;
  animation: rotate 5s linear infinite;
}
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

table {
  position: relative;
  border-collapse: collapse;
  width: 100%;
}
tbody > tr:hover {
  transition: 0.3s;
}
tbody > tr:hover {
  background-color: rgb(235, 230, 230);
}
th {
  background: #fff;
  position: sticky;
  top: -1px;
  border-bottom: 1px solid #ccc;
}
th,
td {
  padding: 0.25rem;
  border: 1px solid #ccc;
  height: 30px;
}
.panel-footer {
  justify-content: flex-end;
  padding: 15px 10px;
  display: flex;
}
.panel-pagination-container {
  display: flex;
  align-items: center;
  width: 250px;
  justify-content: space-between;
}

.pagination-button {
  width: 30px;
  height: 30px;
  background-color: #fff;
  border-radius: 50%;
  padding: 0;
  border: none;
  outline: none;
}
.pagination-button:hover {
  background-color: #eee;
}
</style>
