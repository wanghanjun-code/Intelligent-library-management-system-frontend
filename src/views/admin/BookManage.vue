<template>
  <el-row class="book-row">
    <el-row style="padding: 10px; margin: 0 10px">
      <el-row>
        <el-input
          size="small"
          style="width: 166px"
          v-model="bookQueryDto.name"
          placeholder="Title"
          clearable
          @clear="handleFilterClear"
        >
          <el-button
            slot="append"
            @click="handleFilter"
            icon="el-icon-search"
          ></el-button>
        </el-input>
        <span style="float: right" class="edit-button" @click="add()">
          Add New Book
        </span>
      </el-row>
    </el-row>
    <el-row style="margin: 10px 20px">
      <el-row>
        <el-col
          style="padding: 2px; border: 1px solid rgb(241, 241, 241)"
          v-for="(book, index) in tableData"
          :key="index"
          :span="4"
        >
          <div class="item-book">
            <div style="display: flex; height: 180px; justify-content: center">
              <img
                style="width: 150px; min-height: 180px; border-radius: 5px"
                :src="book.cover"
                alt=""
              />
            </div>
            <div style="padding: 10px 14px">
              <div
                style="
                  color: rgb(51, 51, 51);
                  font-size: 16px;
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
                  margin-block: 4px;
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
                    content="计划上架的书籍"
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
                        >Author:{{ book.author }}</span
                      >
                      <span>【Available Copies:{{ book.num }}】</span>
                    </div>
                  </el-tooltip>
                </div>
                <div>
                  <span @click="handleEdit(book)" class="edit-round">Edit</span>
                  <span
                    @click="handleDelete(book)"
                    style="margin-left: 4px"
                    class="edit-round"
                    >Delete</span
                  >
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-pagination
        style="margin: 20px 0; float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[12, 24]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      >
      </el-pagination>
    </el-row>
    <el-dialog :show-close="false" :visible.sync="dialogOperation" width="60%">
      <div slot="title">
        <p class="dialog-title">
          {{ !isOperation ? "Add New Book" : "Edit Book" }}
        </p>
      </div>
      <div style="padding: 0 40px 40px 40px">
        <el-row>
          <el-col :span="8">
            <div class="point">Book Cover</div>
            <el-upload
              class="avatar-uploader"
              action="/api/book-manage-sys-api/v1.0/file/upload"
              :show-file-list="false"
              :on-success="handleBookCoverSuccess"
            >
              <img v-if="cover" :src="cover" class="dialog-cover" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <div style="margin-bottom: 8px">
              <div class="point">*Bookshelf</div>
              <el-select v-model="data.bookShelfId" placeholder="Please Select">
                <el-option
                  v-for="(item, index) in bookshelfOptions"
                  :key="index"
                  :label="bookshelfConfig(item)"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </div>
            <div style="margin-bottom: 8px">
              <div class="point">*Book Category</div>
              <el-select v-model="data.categoryId" placeholder="Please Select">
                <el-option
                  v-for="(item, index) in options"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </div>

            <div style="margin-bottom: 8px">
              <div class="point">Collection Count</div>
              <el-input-number
                size="small"
                v-model="data.num"
                :min="1"
                :max="100"
                label=""
              ></el-input-number>
            </div>
          </el-col>
          <el-col :span="16">
            <div style="margin-left: 40px">
              <div style="margin-bottom: 8px">
                <div class="point">Book Title</div>
                <input
                  class="dialog-input"
                  v-model="data.name"
                  placeholder=""
                />
              </div>
              <div style="margin-bottom: 8px">
                <div class="point">Publisher</div>
                <input
                  class="dialog-input"
                  v-model="data.publisher"
                  placeholder=""
                />
              </div>
              <div style="margin-bottom: 8px">
                <div class="point">Author</div>
                <input
                  class="dialog-input"
                  v-model="data.author"
                  placeholder=""
                />
              </div>
              <div style="margin-bottom: 8px">
                <div class="point">Book ISBN</div>
                <input
                  class="dialog-input"
                  v-model="data.isbn"
                  placeholder=""
                />
              </div>
              <div>
                <div class="point">Book Summary</div>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  placeholder=""
                  v-model="data.detail"
                >
                </el-input>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <span class="channel-button" @click="cannel()"> Cancel </span>
        <span class="edit-button" v-if="!isOperation" @click="addOperation()">
          Confirm
        </span>
        <span class="edit-button" v-else @click="updateOperation()">
          Confirm
        </span>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      data: { num: 1 },
      currentPage: 1,
      cover: null,
      pageSize: 12,
      totalItems: 0,
      dialogOperation: false, // 开关
      isOperation: false, // 开关-标识新增或修改
      tableData: [],
      delectedRows: [],
      bookQueryDto: {}, // 搜索条件
      options: [],
      bookshelfOptions: [],
      searchTime: []
    };
  },
  created() {
    this.fetchFreshData();
    this.fetchCategory();
    this.fetchBookshelf();
  },
  methods: {
    cannel() {
      this.dialogOperation = false;
      this.isOperation = false;
      this.cover = "";
      this.data = {};
    },
    bookshelfConfig(item) {
      return item.floor + "-" + item.area + "-" + item.frame;
    },
    handleBookCoverSuccess(res, file) {
      if (res.code !== 200) {
        this.$message.error(`Error uploading book cover`);
        return;
      }
      this.$message.success(`Book cover uploaded successfully`);
      this.cover = res.data;
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
    // 多选框选中
    handleSelectionChange(selection) {
      this.delectedRows = selection;
    },
    // 批量删除数据
    async batchDelete() {
      if (!this.delectedRows.length) {
        this.$message(`未选中任何数据`);
        return;
      }
      const confirmed = await this.$swalConfirm({
        title: "Delete Book Data",
        text: `Deletion is irreversible. Do you want to continue?`,
        icon: "warning"
      });
      if (confirmed) {
        try {
          let ids = this.delectedRows.map(entity => entity.id);
          const response = await this.$axios.post(`/book/batchDelete`, ids);
          if (response.data.code === 200) {
            this.$swal.fire({
              title: "Deletion Confirmation",
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
          console.error(`书籍书籍信息删除异常：`, e);
        }
      }
    },
    resetQueryCondition() {
      this.bookQueryDto = {};
      this.fetchFreshData();
    },
    // 修改信息
    async updateOperation() {
      try {
        this.data.cover = this.cover;
        const response = await this.$axios.put("/book/update", this.data);
        this.$swal.fire({
          title: "Modification of Book",
          text: response.data.msg,
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
        const response = await this.$axios.post("/book/save", this.data);
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
          ...this.bookQueryDto
        };
        const response = await this.$axios.post("/book/query", params);
        const { data } = response;
        this.tableData = data.data;
        this.totalItems = data.total;
      } catch (error) {
        console.error("查询书籍书籍信息异常:", error);
      }
    },
    add() {
      this.dialogOperation = true;
      this.isOperation = false;
      this.data = {};
      // this.data.num = 1; // 新增时默认数量为1
      this.cover = null;
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
      this.delectedRows.push(row);
      this.batchDelete();
    }
  }
};
</script>
<style scoped lang="scss">
.book-row {
  background-color: #ffffff;
  padding: 20px 0;
  padding-right: 60px;
  border-radius: 5px;
  width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}
.list-cover {
  width: 50px;
  height: 70px;
  border-radius: 5px;
}

.title {
  width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-book {
  background-color: rgb(255, 255, 255);
  padding: 10px;
  box-sizing: border-box;
}
</style>
