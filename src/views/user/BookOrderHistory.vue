<template>
  <el-row style="margin-top: 20px">
    <!-- 条件搜索 -->
    <div class="word-search">
      <div class="item">
        <input type="text" placeholder="Search" v-model="bookQueryDto.name" />
        <i class="el-icon-search" @click="fetchFreshData"></i>
      </div>
    </div>
    <el-row class="histort-content" style="margin: 10px 0">
      <el-row v-if="tableData.length === 0">
        <el-empty description="No book borrowing history available."></el-empty>
      </el-row>
      <el-row v-else>
        <div>
          <el-col v-for="(book, index) in tableData" :key="index" :span="6">
            <div class="item-book">
              <div style="display: flex; justify-content: center">
                <img
                  style="width: 210px; height: 260px; border-radius: 5px"
                  :src="book.bookCover"
                  alt=""
                />
              </div>
              <div style="padding: 10px 22px">
                <div
                  style="
                    color: rgb(51, 51, 51);
                    font-size: 24px;
                    font-weight: bold;
                    margin-block: 4px;
                  "
                >
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="book.bookName"
                    placement="bottom-end"
                  >
                    <div class="title">{{ book.bookName }}</div>
                  </el-tooltip>
                </div>
                <div class="title" style="margin-block: 8px">
                  <el-tooltip
                    v-if="!book.isReturn"
                    class="item"
                    effect="dark"
                    content="Please return it promptly."
                    placement="bottom-end"
                  >
                    <span
                      style="
                        font-size: 14px;
                        text-decoration: underline;
                        text-decoration-style: dashed;
                      "
                      >Checked Out</span
                    >
                  </el-tooltip>
                  <span v-else style="font-size: 14px">Returned</span>
                </div>
                <div
                  style="
                    margin-block: 6px;
                    font-size: 12px;
                    color: rgb(51, 51, 51);
                    margin-block: 4px;
                  "
                >
                  <div style="font-size: 12px; margin-top: 6px">
                    <div class="title">
                      【{{ book.deadlineNum }}】item on loan
                    </div>
                  </div>
                  <div>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="book.createTime"
                      placement="bottom-end"
                    >
                      <div class="title" style="margin-block: 10px">
                        <span style="margin-right: 5px"
                          >Borrowed: {{ book.createTime }}</span
                        >
                      </div>
                    </el-tooltip>

                    <div class="title" style="margin-block: 10px">
                      <span style="margin-right: 5px"
                        >Due: {{ book.returnTime }}</span
                      >
                    </div>
                  </div>
                </div>
                <div>
                  <span
                    class="edit-round"
                    v-if="book.isReturn === false"
                    @click="handleReturn(book)"
                    >Return</span
                  >
                  <span class="edit-round" v-else @click="handleDelete(book)"
                    >Delete</span
                  >
                </div>
              </div>
            </div>
          </el-col>
        </div>
      </el-row>
    </el-row>
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
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      deadlineNum: 1,
      data: {},
      current: 1,
      cover: null,
      size: 8,
      totalCount: 0,
      allData: [], // 所有数据
      dialogOperation: false, // 开关
      isOperation: false, // 开关-标识新增或修改
      tableData: [], // 当前页数据
      selectedRows: [],
      bookQueryDto: {}, // 搜索条件
      options: [],
      bookshelfOptions: [],
      categoryItemSelected: null,
      categoryList: [],
      bookOrderHistorys: []
    };
  },
  created() {
    this.fetchFreshData();
  },
  methods: {
    handleReturn(book) {
      const bookOrderHistory = {
        id: book.id
      };
      this.$axios
        .put("/bookOrderHistory/update", bookOrderHistory)
        .then(res => {
          if (res.data.code === 200) {
            this.$notify({
              duration: 1000,
              title: "Return Book Operation",
              message: "Returned successfully",
              type: "success"
            });
            this.fetchFreshData();
          }
        })
        .catch(error => {
          console.log("还书异常：", error);
        });
    },
    // 批量删除数据
    async batchDelete(orderHistory) {
      const confirmed = await this.$swalConfirm({
        title: "Delete Book Reservation History Data",
        text: `Once deleted, it cannot be recovered. Do you want to continue?`,
        icon: "warning"
      });
      if (confirmed) {
        try {
          let ids = [orderHistory.id];
          const response = await this.$axios.post(
            `/bookOrderHistory/batchDelete`,
            ids
          );
          const { data } = response;
          if (data.code === 200) {
            this.$notify({
              duration: 1000,
              title: "Deletion Operation",
              message: "Deleted successfully",
              type: "success"
            });
            this.fetchFreshData();
          }
        } catch (error) {
          this.$notify({
            duration: 2000,
            title: "删除失败",
            message: error,
            type: "error"
          });
          console.error(`书籍预约信息删除异常：`, error);
        }
      }
    },
    async fetchFreshData() {
      try {
        const response = await this.$axios.post(
          "/bookOrderHistory/queryUser",
          this.bookQueryDto
        );
        const { data } = response;
        this.allData = data.data || [];
        this.totalCount = this.allData.length;
        this.updateTableData();
      } catch (error) {
        console.error("查询书籍借阅历史信息异常:", error);
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
    }
  }
};
</script>
<style scoped lang="scss">
.histort-content {
  background: white;
  border-radius: 10px;
  padding: 10px;
}
.item-book {
  border: 1px solid rgb(235, 235, 235);

  margin: 5px;
  border-radius: 5px;
  padding: 6px;
  box-sizing: border-box;
}

.title {
  width: 200px;
  overflow: hidden;
  /* 隐藏超出部分 */
  text-overflow: ellipsis;
  /* 使用省略号表示超出部分 */
  white-space: nowrap;
  /* 禁止换行 */
}

.pager {
  display: flex;
  margin-block: 20px;
  justify-content: center;
  align-items: center;
}

.category {
  font-size: 16px;
  color: rgb(114, 114, 114);
  cursor: pointer;
  display: inline-block;
  transition: all 0.2s;
  padding: 10px 20px;
  border-radius: 10px;
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
