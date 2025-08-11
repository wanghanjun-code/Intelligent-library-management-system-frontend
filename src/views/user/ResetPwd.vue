<template>
  <div class="container2">
    <!-- 原始密码 -->
    <div>
      <p>*Current Password</p>
      <input
        class="dialog-input"
        type="password"
        v-model="oldPwd"
        placeholder=""
      />
    </div>
    <!-- 新密码 -->
    <div>
      <p>*New Password</p>
      <input
        class="dialog-input"
        type="password"
        v-model="newPwd"
        placeholder=""
      />
    </div>
    <!-- 确认密码 -->
    <div>
      <p>*Confirm New Password</p>
      <input
        class="dialog-input"
        type="password"
        v-model="againPwd"
        placeholder=""
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
import { clearToken } from "@/utils/storage";
export default {
  name: "ResetPwd",
  data() {
    return {
      oldPwd: "",
      newPwd: "",
      againPwd: ""
    };
  },
  methods: {
    // 提交密码信息
    async postInfo() {
      const userUpdatePwdDTO = {
        oldPwd: this.$md5(this.$md5(this.oldPwd)),
        newPwd: this.$md5(this.$md5(this.newPwd)),
        againPwd: this.$md5(this.$md5(this.againPwd))
      };
      const { data } = await this.$axios.put(
        "/user/updatePwd",
        userUpdatePwdDTO
      );
      this.$notify({
        duration: 1000,
        title: "Modify Password",
        message:
          data.code === 200
            ? "Modification successful, please log in again"
            : data.msg,
        type: data.code === 200 ? "success" : "error"
      });
      if (data.code === 200) {
        clearToken();
        this.$router.push("/");
      }
    }
  }
};
</script>
<style scoped lang="scss">
.container {
  width: 500px;
  margin: 0 auto;
}
</style>
