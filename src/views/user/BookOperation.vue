<template>
  <el-row class="all-conent" style="margin-top: 20px">
    <!-- 条件搜索 -->
    <div class="word-search">
      <div class="item">
        <input type="text" placeholder="Search" v-model="bookQueryDto.name" />
        <i class="el-icon-search" @click="fetchFreshData"></i>
      </div>
    </div>
    <div style="width: 1050px; margin: 0 auto; padding-block: 40px">
      <span
        class="category"
        :style="{
          fontWeight: categoryItemSelected === categoryItem ? '800' : '',
          color: categoryItemSelected === categoryItem ? 'rgb(51,51,51)' : '',
          backgroundColor:
            categoryItemSelected === categoryItem ? 'rgb(247, 247, 247)' : ''
        }"
        @click="categoryChoose(categoryItem)"
        v-for="(categoryItem, index) in options"
        :key="index"
      >
        {{ categoryItem.name }}
      </span>
    </div>
    <el-row style="margin: 10px 0; box-sizing: border-box">
      <el-row v-if="tableData.length === 0">
        <el-empty description="No books yet"></el-empty>
      </el-row>
      <el-row
        v-else
        :gutter="20"
        style="max-width: 1200px; width: 100%; margin: 0 auto"
      >
        <el-col v-for="(book, index) in tableData" :key="index" :span="6">
          <div class="item-book">
            <div style="display: flex; justify-content: center; padding: 10px">
              <img
                style="width: 100%; height: 280px; border-radius: 5px"
                :src="book.cover"
                alt=""
              />
            </div>
            <div style="padding: 10px 30px">
              <div
                style="
                  color: rgb(51, 51, 51);
                  font-size: 22px;
                  font-weight: bold;
                  margin-block: 4px;
                "
              >
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="book.name"
                  placement="bottom-end"
                >
                  <div class="title">{{ book.name }}</div>
                </el-tooltip>
              </div>
              <div
                style="
                  margin-block: 6px;
                  font-size: 12px;
                  color: rgb(51, 51, 51);
                "
              >
                <div class="title" style="margin-block: 8px">
                  <i
                    v-if="book.isPlanBuy"
                    style="margin-right: 5px"
                    class="el-icon-warning"
                  ></i>
                  <i
                    v-else
                    style="margin-right: 5px; color: rgb(253, 199, 50)"
                    class="el-icon-success"
                  ></i>
                  <el-tooltip
                    v-if="book.isPlanBuy"
                    class="item"
                    effect="dark"
                    content="计划上架的书籍，为预售书籍，暂不可借阅"
                    placement="bottom-end"
                  >
                    <span
                      style="
                        text-decoration: underline;
                        text-decoration-style: dashed;
                      "
                      >预售书籍</span
                    >
                  </el-tooltip>
                  <span v-else>Now Available</span>
                  <span> - {{ book.categoryName }}</span>
                </div>
                <div style="font-size: 12px">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="book.publisher"
                    placement="bottom-end"
                  >
                    <div class="title">
                      Published by【{{ book.publisher }}】
                    </div>
                  </el-tooltip>
                </div>
                <div>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="book.author"
                    placement="bottom-end"
                  >
                    <div class="title" style="margin-block: 10px">
                      <span style="margin-right: 5px"
                        >Author: {{ book.author }}</span
                      >
                      <span>{{ book.num }} copies in stock</span>
                    </div>
                  </el-tooltip>
                </div>
                <div>
                  <span v-if="!book.isPlanBuy">
                    <span style="color: blue" v-if="book.isSave">Saved</span>
                    <span
                      v-else
                      class="edit-round"
                      style="margin-right: 5px"
                      @click="saveBook(book)"
                    >
                      <i class="el-icon-star-off"></i>
                      Save
                    </span>
                    <span style="margin-left: 5px">
                      <!-- 库存不足 -->
                      <span v-if="book.num === 0">Unavailable</span>
                      <span v-else>
                        <!-- 没借过书的情况 -->
                        <span v-if="book.isReturn === null">
                          <span
                            style="margin-left: 4px"
                            class="edit-round"
                            @click="handleEdit(book)"
                            >Borrow</span
                          >
                        </span>
                        <span v-else>
                          <!-- 待归还状态，只做显示 -->
                          <span v-if="!book.isReturn" style="color: blue"
                            >Checked Out</span
                          >
                          <span
                            v-else
                            style="margin-left: 4px"
                            class="edit-round"
                            @click="handleEdit(book)"
                            >Borrow</span
                          >
                        </span>
                      </span>
                    </span>
                  </span>
                  <span v-else>
                    <span style="color: #999">预售书籍暂不可借阅</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-row>
    <div class="pager">
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
      width="18%"
    >
      <div style="padding: 0px 20px 20px 15px">
        <div style="margin-bottom: 10px">
          <div class="point">Number:</div>
          <el-input-number
            style="width: 100%"
            size="small"
            v-model="deadlineNum"
            :min="1"
            :max="10"
            label="数量"
          ></el-input-number>
        </div>
        <div>
          <div class="point">Return Date: {{ calculateDueDate() }}</div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <span class="channel-button" @click="dialogOperation = false">
          Cancel
        </span>
        <span class="edit-button" @click="addOperation()"> Confirm </span>
      </span>
    </el-dialog>
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
      size: 8, // 每页8本
      totalCount: 0,
      dialogOperation: false, // 开关
      isOperation: false, // 开关-标识新增或修改
      tableData: [],
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

      return dueDate
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour12: false
        })
        .replace(/,/g, "");
    },
    categoryChoose(category) {
      this.categoryItemSelected = category;
      this.bookQueryDto.categoryId = category.id;
      this.fetchFreshData();
    },

    // 收藏书籍
    async saveBook(book) {
      const confirmed = await this.$swalConfirm({
        title: "Save This Book?",
        text: `Your saved books appear in My Favorites for quick access.`,
        icon: "info"
      });
      if (confirmed) {
        try {
          const bookSave = { bookId: book.id };
          const response = await this.$axios.post(`/bookSave/save`, bookSave);
          this.$notify({
            title: "Favorite Operation",
            message:
              response.data.code === 200
                ? "Bookmarked successfully"
                : response.data.msg,
            type: response.data.code === 200 ? "success" : "warning"
          });
          this.fetchFreshData();
        } catch (e) {
          console.error(`收藏错误：`, e);
        }
      }
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
          // 添加全部
          this.options.unshift({ id: null, name: "All" });
          // 默认加载全部
          this.categoryChoose(this.options[0]);
        }
      });
    },
    resetQueryCondition() {
      this.bookQueryDto = {};
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
    async addOperation() {
      try {
        this.data.bookId = this.data.id;
        this.data.deadlineNum = this.deadlineNum;
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
          this.fetchFreshData();
        } else {
          this.$notify({
            title: "Borrow Result",
            message: response.data.msg,
            type: "error"
          });
        }
      } catch (error) {
        this.$notify({
          title: "Borrow Result",
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
        // 请求参数
        const params = {
          current: this.current,
          size: this.size, // 每页8本
          ...this.bookQueryDto
        };
        const response = await this.$axios.post("/book/query", params);
        const { data } = response;
        this.tableData = data.data;
        this.totalCount = data.total;
      } catch (error) {
        console.error("查询书籍书籍信息异常:", error);
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
.all-conent {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-sizing: border-box;
}
.item-book {
  border: 1px solid rgb(235, 235, 235);
  height: 480px;
  border-radius: 5px;
  margin: 5px;
  box-sizing: border-box;
}

.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
