<template>
  <el-row
    style="background-color: #ffffff; padding: 20px 0; border-radius: 5px"
  >
    <el-row style="padding: 10px; margin: 0 10px">
      <el-row>
        <span class="top-bar">Floor</span>
        <el-input
          size="small"
          style="width: 188px; margin-right: 10px"
          v-model="bookshelfQueryDto.floor"
          placeholder=""
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
        <el-button
          size="small"
          style="
            background-color: rgb(235, 237, 245);
            color: rgb(43, 121, 203);
            border: none;
          "
          class="customer"
          type="info"
          @click="add()"
          >Add New Shelf</el-button
        >
      </el-row>
    </el-row>
    <el-row style="margin: 10px 20px">
      <el-table :data="tableData">
        <el-table-column
          prop="floor"
          label="Shelf Location Floor"
        ></el-table-column>
        <el-table-column
          prop="area"
          width="188"
          label="Shelf Zone"
        ></el-table-column>
        <el-table-column
          prop="frame"
          width="148"
          label="Shelf Name"
        ></el-table-column>
        <el-table-column label="Actions">
          <template slot-scope="scope" width="120">
            <span class="text-button" @click="handleEdit(scope.row)">Edit</span>
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
        <p class="dialog-title">
          {{ !isOperation ? "Add New Shelf" : "Edit Shelf" }}
        </p>
      </div>
      <div style="padding: 0 20px 40px 15px">
        <div style="margin-bottom: 8px">
          <div class="point">Shelf Location Floor</div>
          <input class="dialog-input" v-model="data.floor" placeholder="" />
        </div>
        <div style="margin-bottom: 8px">
          <div class="point">Shelf Area</div>
          <input class="dialog-input" v-model="data.area" placeholder="" />
        </div>
        <div style="margin-bottom: 8px">
          <div class="point">Shelf Name</div>
          <input class="dialog-input" v-model="data.frame" placeholder="" />
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          v-if="!isOperation"
          style="background-color: rgb(43, 121, 203); border: none"
          class="customer"
          type="info"
          @click="addOperation"
          >Add</el-button
        >
        <el-button
          size="small"
          v-else
          style="background-color: rgb(43, 121, 203); border: none"
          class="customer"
          type="info"
          @click="updateOperation"
          >Edit</el-button
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
      cover: null,
      pageSize: 7,
      totalItems: 0,
      dialogOperation: false, // 开关
      isOperation: false, // 开关-标识新增或修改
      tableData: [],
      selectedRows: [],
      bookshelfQueryDto: {}, // 搜索条件
      options: []
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
        title: "Delete Shelf Data",
        text: `Deletion is irreversible, do you want to continue?`,
        icon: "warning"
      });
      if (confirmed) {
        try {
          let ids = this.selectedRows.map(entity => entity.id);
          const response = await this.$axios.post(
            `/bookshelf/batchDelete`,
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
            title: "Error Prompt",
            text: e,
            icon: "error",
            showConfirmButton: false,
            timer: 2000
          });
          console.error(`Shelf data deletion error:`, e);
        }
      }
    },
    resetQueryCondition() {
      this.bookshelfQueryDto = {};
      this.fetchFreshData();
    },
    // 修改信息
    async updateOperation() {
      try {
        this.data.cover = this.cover;
        const response = await this.$axios.put("/bookshelf/update", this.data);
        this.$swal.fire({
          title: "Shelf Information Modification",
          text: response.data.code === 200 ? "success" : "error",
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
        this.data.cover = this.cover;
        const response = await this.$axios.post("/bookshelf/save", this.data);
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
          ...this.bookshelfQueryDto
        };
        const response = await this.$axios.post("/bookshelf/query", params);
        const { data } = response;
        this.tableData = data.data;
        this.totalItems = data.total;
      } catch (error) {
        console.error("查询书架书架信息异常:", error);
      }
    },
    add() {
      this.dialogOperation = true;
      this.isOperation = false;
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
