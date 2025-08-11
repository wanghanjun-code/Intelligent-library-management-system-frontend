<template>
  <el-row
    style="background-color: #ffffff; padding: 20px 0; border-radius: 5px"
  >
    <el-row style="padding: 10px; margin: 0 10px">
      <el-row>
        <span class="top-bar">Feedback</span>
        <el-input
          size="small"
          style="width: 188px; margin-right: 10px"
          v-model="readingProposalQueryDto.content"
          placeholder="Issues"
          clearable
          @clear="handleFilterClear"
        >
        </el-input>
        <el-button
          size="small"
          class="customer"
          style="
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
        <el-table-column
          prop="userName"
          width="98"
          label="User"
        ></el-table-column>
        <el-table-column
          prop="content"
          label="Feedback Content"
        ></el-table-column>

        <el-table-column
          prop="replyContent"
          width="178"
          label="Reply Content"
        ></el-table-column>
        <el-table-column
          prop="replyTime"
          width="258"
          label="Reply Time"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          width="258"
          label="Submission Time"
        ></el-table-column>
        <el-table-column label="Actions" width="140">
          <template slot-scope="scope">
            <span
              v-if="scope.row.replyTime === null"
              class="text-button"
              @click="handleEdit(scope.row)"
              >Reply</span
            >
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
    <el-dialog :visible.sync="dialogOperation" width="25%">
      <div slot="title">
        <p class="dialog-title">Reply</p>
      </div>
      <div style="padding: 0 20px 40px 15px">
        <el-input
          type="textarea"
          :rows="6"
          placeholder="Type your message here..."
          v-model="data.replyContent"
        >
        </el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          style="background-color: rgb(43, 121, 203); border: none"
          class="customer"
          type="info"
          @click="updateOperation"
          >Confirm</el-button
        >
        <el-button
          class="customer"
          size="small"
          style="background-color: rgb(241, 241, 241); border: none"
          @click="dialogOperation = false"
          >Cancel</el-button
        >
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      data: {},
      currentPage: 1,
      pageSize: 7,
      totalItems: 0,
      dialogOperation: false, // 开关
      isOperation: false, // 开关-标识新增或修改
      tableData: [],
      selectedRows: [],
      readingProposalQueryDto: {} // 搜索条件
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
        title: "Delete Feedback Data",
        text: `It cannot be recovered after deletion. Do you want to continue?`,
        icon: "warning"
      });
      if (confirmed) {
        try {
          let ids = this.selectedRows.map(entity => entity.id);
          const response = await this.$axios.post(
            `/readerProposal/batchDelete`,
            ids
          );
          if (response.data.code === 200) {
            this.$swal.fire({
              title: "Deletion Confirmation",
              text: "Deletion successful",
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
          console.error(`反馈信息删除异常：`, e);
        }
      }
    },
    resetQueryCondition() {
      this.readingProposalQueryDto = {};
      this.fetchFreshData();
    },
    // 修改信息
    async updateOperation() {
      try {
        const response = await this.$axios.put(
          "/readerProposal/update",
          this.data
        );
        this.$swal.fire({
          title: "Reply Operation",
          // text: "Reply Successful",
          icon: response.data.code === 200 ? "success" : "error",
          showConfirmButton: false,
          timer: 1000
        });
        if (response.data.code === 200) {
          this.closeDialog();
          this.fetchFreshData();
          this.clearFormData();
        }
      } catch (error) {
        console.error("提交表单时出错:", error);
        this.$message.error("Submission failed. Please try again later!");
      }
    },
    // 信息新增
    async addOperation() {
      try {
        const response = await this.$axios.post(
          "/readerProposal/save",
          this.data
        );
        this.$message[response.data.code === 200 ? "success" : "error"](
          response.data.msg
        );
        if (response.data.code === 200) {
          this.closeDialog();
          this.fetchFreshData();
          this.clearFormData();
        }
      } catch (error) {
        console.error("提交表单时出错:", error);
        this.$message.error("Submission failed. Please try again later!");
      }
    },
    closeDialog() {
      this.dialogOperation = false;
    },
    clearFormData() {
      this.data = {};
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
          ...this.readingProposalQueryDto
        };
        const response = await this.$axios.post(
          "/readerProposal/query",
          params
        );
        const { data } = response;
        this.tableData = data.data;
        this.totalItems = data.total;
      } catch (error) {
        console.error("查询反馈信息异常:", error);
      }
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
      row.userPwd = null;
      this.data = { ...row };
    },
    handleDelete(row) {
      this.selectedRows.push(row);
      this.batchDelete();
    }
  }
};
</script>
<style scoped lang="scss"></style>
