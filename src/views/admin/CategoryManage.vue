<template>
  <el-row
    style="background-color: #ffffff; padding: 20px 0; border-radius: 5px"
  >
    <el-row style="padding: 10px; margin: 0 10px">
      <el-row>
        <span class="top-bar">Category Name</span>
        <el-input
          size="small"
          style="width: 188px; margin-right: 10px"
          v-model="categoryQueryDto.name"
          placeholder="Book Category Name"
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
          >Add New Category</el-button
        >
      </el-row>
    </el-row>
    <el-row style="margin: 10px 20px">
      <el-table :data="tableData">
        <el-table-column prop="name" label="Book Category"></el-table-column>
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
        :page-sizes="[10, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      ></el-pagination>
    </el-row>
    <el-dialog :visible.sync="dialogOperation" width="25%">
      <div slot="title">
        <p class="dialog-title">
          {{ !isOperation ? "Add New Category" : "Edit Category" }}
        </p>
      </div>
      <div style="padding: 0 20px 40px 15px">
        <input
          class="dialog-input"
          v-model="data.name"
          placeholder="Category Name"
        />
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
          @click="cannel"
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
      pageSize: 10,
      totalItems: 0,
      dialogOperation: false, // 开关
      isOperation: false, // 开关-标识新增或修改
      tableData: [],
      selectedRows: [],
      categoryQueryDto: {} // 搜索条件
    };
  },
  created() {
    this.fetchFreshData();
  },
  methods: {
    // 取消
    cannel() {
      this.resetValue(false, false);
    },
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
        title: "Delete Book Category Data",
        text: `It cannot be recovered after deletion. Do you want to continue?`,
        icon: "warning"
      });
      if (confirmed) {
        try {
          let ids = this.selectedRows.map(entity => entity.id);
          const response = await this.$axios.post(`/category/batchDelete`, ids);
          if (response.data.code === 200) {
            this.$swal.fire({
              title: "Deletion Confirmation",
              text: "Deletion successful",
              icon: "success",
              showConfirmButton: false,
              timer: 1000
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
          console.error(`书籍类别信息删除异常：`, e);
        }
      }
    },
    resetQueryCondition() {
      this.categoryQueryDto = {};
      this.fetchFreshData();
    },
    // 书籍类别修改
    updateOperation() {
      this.$axios
        .put("/category/update", this.data)
        .then(res => {
          if (res.data.code === 200) {
            this.$notify({
              duration: 1000,
              title: "Category Update",
              message: "Category updated successfully",
              type: "success"
            });
            this.resetValue(false, false);
          }
        })
        .catch(error => {
          this.$message.error("Book update error: " + error);
          console.log("书籍修改异常：", error);
        });
    },
    resetValue(v1, v2) {
      this.isOperation = v1;
      this.dialogOperation = v2;
      this.data = {};
      this.fetchFreshData();
    },
    // 新增书籍类别
    addOperation() {
      this.$axios
        .post("/category/save", this.data)
        .then(res => {
          if (res.data.code === 200) {
            this.$notify({
              duration: 1000,
              title: "Category added",
              message: "Category added successfully",
              type: "success"
            });
            this.resetValue(false, false);
          }
        })
        .catch(error => {
          this.$message.error("书籍新增异常：" + error);
          console.log("书籍新增异常：", error);
        });
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
          ...this.categoryQueryDto
        };
        const response = await this.$axios.post("/category/query", params);
        const { data } = response;
        this.tableData = data.data;
        this.totalItems = data.total;
      } catch (error) {
        console.error("查询书籍类别信息异常:", error);
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
<style scoped lang="scss">
.tag-tip {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: rgb(245, 245, 245);
  color: rgb(104, 118, 130);
}

.input-def {
  height: 40px;
  line-height: 40px;
  outline: none;
  border: none;
  font-size: 20px;
  color: rgb(102, 102, 102);
  font-weight: 900;
  width: 100%;
}

.dialog-footer {
  /* 使按钮水平居中 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 如果需要调整按钮之间的间距 */
.customer {
  margin: 0 8px;
  /* 根据需要调整间距 */
}
</style>
