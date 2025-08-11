<template>
  <div style="background-color: rgb(248, 249, 250)">
    <div
      style="
        width: 800px;
        margin: 0 auto;
        padding: 30px 0;
        box-sizing: border-box;
        min-height: 100vh;
      "
    >
      <p style="font-size: 22px; padding: 20px 0">
        {{
          noticeOperation === "save"
            ? "Create New Announcement"
            : "Edit Announcement"
        }}
      </p>
      <div>
        <div style="margin: 20px 0">
          <input type="text" placeholder="Title" v-model="notice.name" />
        </div>
        <div>
          <Editor
            height="calc(100vh - 500px)"
            :receiveContent="notice.content"
            @on-receive="receiveData"
          />
        </div>
      </div>
      <div style="margin: 20px 0; text-align: center">
        <span class="operation-btn" @click="operation">
          {{ noticeOperation === "save" ? "Add Now" : "Update Now " }}
          <i class="el-icon-right"></i>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import Editor from "@/components/Editor";
export default {
  components: { Editor },
  data() {
    return {
      notice: {},
      saveApi: "/notice/save",
      updateApi: "/notice/update",
      noticeOperation: ""
    };
  },
  created() {
    this.loadOperation();
  },
  methods: {
    operation() {
      if (this.noticeOperation === "save") {
        this.save();
        return;
      }
      this.update();
    },
    loadOperation() {
      const operation = sessionStorage.getItem("noticeOperation");
      console.log(operation);
      if (operation === "update") {
        const notice = sessionStorage.getItem("noticeInfo");
        this.notice = JSON.parse(notice);
      }
      this.noticeOperation = sessionStorage.getItem("noticeOperation");
    },
    receiveData(html) {
      this.notice.content = html;
    },
    update() {
      this.$axios.put(this.updateApi, this.notice).then(response => {
        if (response.data.code === 200) {
          this.$swal.fire({
            title: "Edit Announcement",
            text: "Update Successful",
            icon: "success",
            showConfirmButton: false,
            timer: 1000
          });
          // 返回上一级
          this.$router.go(-1);
        }
      });
    },
    save() {
      this.$axios.post(this.saveApi, this.notice).then(response => {
        if (response.data.code === 200) {
          this.$swal.fire({
            title: "Create Announcement",
            text: "Announcement Published",
            icon: "success",
            showConfirmButton: false,
            timer: 1000
          });
          // 返回上一级
          this.$router.go(-1);
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
input {
  outline: none;
  border: none;
  width: 100%;
  padding: 18px 12px;
  font-size: 24px;
  box-sizing: border-box;
  border-radius: 5px;
  font-weight: bold;
}

.operation-btn {
  padding: 14px 40px;
  background-color: rgb(235, 237, 245);
  color: rgb(43, 121, 203);
  border: none;
  font-size: 12px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
