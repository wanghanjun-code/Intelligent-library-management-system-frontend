<template>
  <div class="container1">
    <!-- 头像 -->
    <div>
      <p>*Avatar</p>
      <el-upload
        class="avatar-uploader"
        action="http://localhost:21090/api/book-manage-sys-api/v1.0/file/upload"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
      >
        <img
          v-if="userAvatar"
          :src="userAvatar"
          style="width: 88px; height: 88px"
        />
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
    </div>
    <!-- 昵称 -->
    <div>
      <p>*Nickname</p>
      <input
        class="dialog-input"
        v-model="userInfo.userName"
        placeholder="请输入"
      />
    </div>
    <!-- 邮箱 -->
    <div>
      <p>*Email</p>
      <input
        class="dialog-input"
        v-model="userInfo.userEmail"
        placeholder="请输入"
      />
    </div>
    <div>
      <div style="margin-top: 20px; text-align: center">
        <el-button
          type="primary"
          class="customer"
          size="mini"
          @click="postInfo"
          round
          >Update Now</el-button
        >
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Self",
  data() {
    return {
      userInfo: {},
      userAvatar: ""
    };
  },
  created() {
    this.auth();
  },
  methods: {
    // 提交个人信息修改
    async postInfo() {
      const { userName, userEmail } = this.userInfo;
      const userUpdateDTO = {
        userAvatar: this.userAvatar,
        userName,
        userEmail
      };
      const { data } = await this.$axios.put("/user/update", userUpdateDTO);
      this.$notify({
        position: "buttom-right",
        duration: 1000,
        title: "Edit Personal Information",
        message: data.code === 200 ? "Edit Successful" : "Edit Failed",
        type: data.code === 200 ? "success" : "error"
      });
      // 返回首页
      if (data.code === 200) {
        this.auth();
      }
    },
    // 头像上传
    handleAvatarSuccess(res, file) {
      this.$notify({
        duration: 1500,
        title: "头像上传",
        message: res.code === 200 ? "上传成功" : "上传失败",
        type: res.code === 200 ? "success" : "error"
      });
      // 上传成功则更新用户头像
      if (res.code === 200) {
        this.userAvatar = res.data;
      }
    },
    // Token 检验 ,取得用户信息
    async auth() {
      const { data } = await this.$axios.get("/user/auth");
      if (data.code !== 200) {
        // Token校验异常
        this.$router.push("/");
      } else {
        this.userInfo = data.data;
        this.userAvatar = data.data.userAvatar;
      }
    }
  }
};
</script>
<style scoped lang="scss">
.container {
  width: 500px;
  margin: 0 auto;
  padding: 0;
}
</style>
