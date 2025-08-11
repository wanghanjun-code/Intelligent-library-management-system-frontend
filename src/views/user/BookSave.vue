<template>
  <el-row style="margin-top: 20px">
    <div class="word-search" v-if="tableData.length !== 0">
      <div class="item">
        <input
          type="text"
          placeholder="Search"
          v-model="bookSaveQueryDto.name"
        />
        <i class="el-icon-search" @click="fetchFreshData"></i>
      </div>
    </div>
    <el-row class="histort-content" v-if="tableData.length === 0">
      <el-empty description="No books in favorites"></el-empty>
    </el-row>
    <div
      v-else
      class="histort-content"
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        margin-block: 20px;
      "
    >
      <div>
        <div class="save-book">
          <div class="title">Title</div>
          <div class="title">Author</div>
          <div class="title">Copies</div>
          <div class="title">Location</div>
          <div class="title">Actions</div>
        </div>
        <div class="save-book" v-for="(save, index) in tableData" :key="index">
          <div class="book-title">
            {{ save.bookName }}
          </div>
          <div>
            {{ save.author }}
          </div>
          <div>
            {{ save.num }}
          </div>
          <div>
            {{ parseLocation(save) }}
          </div>
          <div>
            <span class="text-button" @click="handleEdit(save)">Borrow</span>
            <span class="text-button" @click="handleDelete(save)">Remove</span>
          </div>
        </div>
      </div>
    </div>
    <div class="pager" v-if="tableData.length !== 0">
      <div>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="current"
          :page-size="size"
          layout="total, prev, pager, next"
          :total="totalCount"
        >
        </el-pagination>
      </div>
    </div>
    <el-dialog
      :show-close="false"
      title="Borrow Book"
      :visible.sync="dialogOperation"
      width="24%"
    >
      <div style="padding: 20px 25px 25px 15px">
        <div style="margin-bottom: 10px">
          <div class="point">Number of Books to Borrow</div>
          <el-input-number
            style="width: 100%"
            size="small"
            v-model="data.deadlineNum"
            :min="1"
            :max="10"
            label="数量"
          ></el-input-number>
        </div>
        <div>
          <div class="point">Return Date:{{ calculateDueDate() }}</div>
          <!-- <div class="point">归还日期</div>
          <el-date-picker
            style="width: 100%"
            size="small"
            v-model="data.returnTime"
            type="date"
            placeholder="选择日期"
          >
          </el-date-picker> -->
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <span class="channel-button" @click="cannel()"> Cancel </span>
        <span class="edit-button" @click="addOperation"> Confirm </span>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      data: {},
      current: 1,
      cover: null,
      size: 8,
      totalCount: 0,
      allData: [], // 所有数据
      dialogOperation: false, // 开关
      isOperation: false, // 开关-标识新增或修改
      tableData: [],
      selectedRows: [],
      bookSaveQueryDto: {}, // 搜索条件
      options: [],
      bookshelfOptions: [],
      bookOrderHistorys: [],
      searchTime: []
    };
  },
  created() {
    this.fetchFreshData();
    this.fetchCategory();
    this.fetchBookshelf();
  },
  methods: {
    calculateDueDate() {
      if (!this.data.borrowDate) {
        // 如果没有借书日期，默认使用当前日期
        this.data.borrowDate = new Date();
      }

      const dueDate = new Date(this.data.borrowDate);
      dueDate.setDate(dueDate.getDate() + 30); // 加30天

      // 保存实际值到数据对象（ISO格式）
      this.data.returnTime = dueDate.toISOString();

      // 返回友好格式显示 - 修改为年月日格式
      return (
        dueDate
          // .toLocaleDateString("zh-CN", {
          //   year: "numeric",
          //   month: "2-digit",
          //   day: "2-digit",
          //   hour12: false,
          // })
          // .replace(/\//g, "年") + "日"
          .toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour12: false
          })
          .replace(/,/g, "")
      );
    },
    cannel() {
      this.data = {};
      this.dialogOperation = false;
      this.isOperation = false;
    },
    // 借书操作
    async addOperation() {
      try {
        if (
          this.data.deadlineNum === undefined ||
          this.data.returnTime === undefined
        ) {
          this.$notify({
            duration: 1000,
            title: "Action Feedback",
            message: "Please fill in the information",
            type: "info"
          });
          return;
        }
        const response = await this.$axios.post(
          "/bookOrderHistory/save",
          this.data
        );
        if (response.data.code === 200) {
          this.fetchFreshData();
          this.data = {};
          this.dialogOperation = false;
          this.$notify({
            title: "Borrow Result",
            message:
              "Borrowed successfully. Please return the book(s) promptly.",
            type: "success"
          });
        } else {
          this.$notify({
            title: "Borrow Result",
            message: response.data.msg,
            type: "error"
          });
          this.dialogOperation = false;
        }
      } catch (error) {
        this.$notify({
          title: "Borrow Result",
          message: error,
          type: "error"
        });
      }
    },

    parseLocation(data) {
      return data.floor + "-" + data.area + "-" + data.frame;
    },
    bookshelfConfig(item) {
      return item.floor + "-" + item.area + "-" + item.frame;
    },
    fetchBookshelf() {
      this.$axios.post("bookshelf/query", {}).then(res => {
        if (res.data.code === 200) {
          this.bookshelfOptions = res.data.data;
        }
      });
    },
    fetchCategory() {
      this.$axios.post("category/query", {}).then(res => {
        if (res.data.code === 200) {
          this.options = res.data.data;
        }
      });
    },

    resetQueryCondition() {
      this.bookSaveQueryDto = {};
      this.fetchFreshData();
    },

    // 查询用户的预约记录
    getBookOrderHistory() {
      this.$axios.post("bookOrderHistory/queryUser", {}).then(res => {
        if (res.data.code === 200) {
          this.bookOrderHistorys = res.data.data;
        }
      });
    },

    // 信息新增
    async returnOperation() {
      try {
        // 发之前，组装数据
        const bookOrderHsitory = {
          id: this.data.id,
          isReturn: true
        };
        const response = await this.$axios.put(
          "/bookSave/update",
          bookOrderHsitory
        );
        if (response.data.code === 200) {
          this.fetchFreshData();
          this.data = {};
          this.dialogOperation = false;
          this.$notify({
            title: "还书结果",
            message: "还书成功",
            type: "success"
          });
        } else {
          this.$notify({
            title: "还书结果",
            message: response.data.msg,
            type: "error"
          });
        }
      } catch (error) {
        this.$notify({
          title: "还书结果",
          message: error,
          type: "error"
        });
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
        const response = await this.$axios.post(
          "/bookSave/queryUser",
          this.bookSaveQueryDto
        );
        const { data } = response;
        this.allData = data.data || [];
        this.totalCount = this.allData.length;
        this.updateTableData();
      } catch (error) {
        console.error("借阅历史信息异常:", error);
      }
    },
    updateTableData() {
      const start = (this.current - 1) * this.size;
      const end = start + this.size;
      this.tableData = this.allData.slice(start, end);
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
      this.size = val;
      this.current = 1;
      this.updateTableData();
    },
    handleCurrentChange(val) {
      this.current = val;
      this.updateTableData();
    },
    messagePush(row) {
      this.data = { ...row };
    },
    handleEdit(row) {
      this.dialogOperation = true;
      this.data = { ...row };
    },
    handleDelete(row) {
      this.batchDelete(row);
    },
    // 批量删除数据
    async batchDelete(save) {
      const confirmed = await this.$swalConfirm({
        title: "Cancel Bookmark?",
        text: `This action is irreversible. Proceed?  `,
        icon: "warning"
      });
      if (confirmed) {
        try {
          let ids = [save.id];
          const response = await this.$axios.post(`/bookSave/batchDelete`, ids);
          if (response.data.code === 200) {
            this.$notify({
              duration: 1000,
              title: "Cancel Bookmark Operation",
              message: "Bookmark canceled successfully",
              type: "success"
            });
            this.fetchFreshData();
          }
        } catch (e) {
          this.$notify({
            duration: 3000,
            title: "Cancel Bookmark Operation",
            message: error,
            type: "error"
          });
          console.error(`取消收藏异常：`, e);
        }
      }
    }
  }
};
</script>
<style scoped lang="scss">
.histort-content {
  background: white;
  border-radius: 10px;
  padding: 10px;
  padding-top: 20px;
  /* min-height: 90vh; */
}
.pager {
  display: flex;
  margin-block: 20px;
  justify-content: center;
  align-items: center;
}

.save-book:hover {
  background-color: rgb(248, 248, 248);
}

.save-book {
  display: flex;
  justify-content: left;
  align-items: center;

  div {
    width: 160px;
    padding: 30px;
  }
  .book-title {
    white-space: nowrap; /* 禁止换行 */
    overflow: hidden; /* 隐藏溢出内容 */
    text-overflow: ellipsis; /* 显示省略号 */
    width: 160px !important; /* 设置固定宽度 */
  }

  .title {
    background-color: rgb(248, 248, 248);
  }
}

.word-search {
  display: flex;
  justify-content: center;

  .item {
    padding: 14px;
    width: 500px;
    background-color: rgb(247, 247, 247);
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;

    input {
      border: none;
      background-color: rgb(247, 247, 247);
      outline: none;
      font-size: 16px;
    }

    i {
      padding: 6px;
      border-radius: 5px;
      cursor: pointer;
    }

    i:hover {
      background-color: rgb(241, 241, 241);
    }
  }
}
</style>
