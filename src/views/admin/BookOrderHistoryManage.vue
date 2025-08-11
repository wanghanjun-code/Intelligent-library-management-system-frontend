<template>
  <el-row
    style="background-color: #ffffff; padding: 20px 0; border-radius: 5px"
  >
    <el-row style="padding: 10px; margin: 0 10px">
      <el-row>
        <span class="top-bar">Borrowing Period</span>
        <el-date-picker
          size="small"
          style="width: 220px"
          v-model="searchTime"
          type="daterange"
          range-separator="to"
          start-placeholder="Start Date"
          end-placeholder="End Date"
        >
        </el-date-picker>
        <el-button
          size="small"
          class="customer"
          style="
            margin-left: 10px;
            background-color: rgb(235, 237, 245);
            color: rgb(43, 121, 203);
            border: none;
          "
          type="primary"
          @click="handleFilter"
          >Search</el-button
        >
      </el-row>
    </el-row>
    <el-row style="margin: 10px 20px">
      <el-table :data="tableData">
        <el-table-column prop="bookName" label="Book Title"></el-table-column>
        <el-table-column
          prop="userName"
          width="98"
          label="Borrower"
        ></el-table-column>
        <el-table-column
          prop="deadlineNum"
          width="128"
          label="Collection Count"
        ></el-table-column>
        <el-table-column prop="isReturn" width="130" label="Return Status">
          <template slot-scope="scope">
            <span>{{ scope.row.isReturn ? "Returned" : "Not Returned" }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="returnTime"
          width="168"
          label="Return Date"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          width="178"
          label="Borrowing Period"
        ></el-table-column>
        <el-table-column label="Actions" fixed="right" width="90">
          <template slot-scope="scope">
            <span class="text-button" @click="handleDelete(scope.row)"
              >Delete</span
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin: 20px 0; float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 7]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      ></el-pagination>
    </el-row>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      data: {},
      currentPage: 1,
      cover: null,
      pageSize: 7,
      totalItems: 0,
      tableData: [],
      selectedRows: [],
      bookOrderHistoryQueryDto: {}, // 搜索条件
      options: [],
      bookshelfOptions: [],
      searchTime: []
    };
  },
  created() {
    this.fetchFreshData();
  },
  methods: {
    // 多选框选中
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },
    // 批量删除数据
    async batchDelete() {
      if (!this.selectedRows.length) {
        this.$message(`未选中任何数据`);
        return;
      }
      const confirmed = await this.$swalConfirm({
        title: "Delete Borrowing Record Data",
        text: `This action cannot be undone. Are you sure you want to continue?`,
        icon: "warning"
      });
      if (confirmed) {
        try {
          let ids = this.selectedRows.map(entity => entity.id);
          const response = await this.$axios.post(
            `bookOrderHistory/batchDelete`,
            ids
          );
          if (response.data.code === 200) {
            this.$swal.fire({
              title: "Deletion Confirmation",
              text: "Deletion Successful",
              icon: "success",
              showConfirmButton: false,
              timer: 2000
            });
            this.fetchFreshData();
            return;
          }
        } catch (e) {
          this.$swal.fire({
            title: "错误提示",
            text: e,
            icon: "error",
            showConfirmButton: false,
            timer: 2000
          });
          console.error(`借阅历史删除异常：`, e);
        }
      }
    },
    resetQueryCondition() {
      this.searchTime = [];
      this.bookOrderHistoryQueryDto = {};
      this.fetchFreshData();
    },
    closeDialog() {
      this.dialogOperation = false;
    },
    clearFormData() {
      this.data = {};
      this.cover = null;
    },
    async fetchFreshData() {
      try {
        this.tableData = [];
        let startTime = null;
        let endTime = null;
        if (this.searchTime != null && this.searchTime.length === 2) {
          const [startDate, endDate] = await Promise.all(
            this.searchTime.map(date => date.toISOString())
          );
          startTime = `${startDate.split("T")[0]}T00:00:00`;
          endTime = `${endDate.split("T")[0]}T23:59:59`;
        }
        // 请求参数
        const params = {
          current: this.currentPage,
          size: this.pageSize,
          startTime: startTime,
          endTime: endTime,
          ...this.bookOrderHistoryQueryDto
        };
        const response = await this.$axios.post(
          "bookOrderHistory/query",
          params
        );
        const { data } = response;
        this.tableData = data.data;
        this.totalItems = data.total;
      } catch (error) {
        console.error("查询借阅记录信息异常:", error);
      }
    },
    add() {
      this.dialogOperation = true;
    },
    handleFilter() {
      this.currentPage = 1;
      this.fetchFreshData();
    },
    handleFilterClear() {
      this.handleFilter();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.fetchFreshData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchFreshData();
    },
    messagePush(row) {
      this.data = { ...row };
    },
    handleEdit(row) {
      this.dialogOperation = true;
      this.isOperation = true;
      this.data = { ...row };
      this.cover = row.cover;
    },
    handleDelete(row) {
      this.selectedRows.push(row);
      this.batchDelete();
    }
  }
};
</script>
<style scoped lang="scss">
.list-cover {
  width: 50px;
  height: 70px;
  border-radius: 5px;
}
</style>
