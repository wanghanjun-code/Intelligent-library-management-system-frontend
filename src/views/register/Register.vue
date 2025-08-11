<template>
  <div class="register-containel">
    <div class="register-panel">
      <div class="logo"></div>
      <div class="text">
        <input v-model="act" class="act" placeholder="Register an account" />
      </div>
      <div class="text">
        <input v-model="name" class="act" placeholder="Username" />
      </div>
      <div class="text">
        <input
          v-model="pwd"
          class="pwd"
          type="password"
          placeholder="Password"
        />
      </div>
      <div class="text">
        <input
          v-model="pwdConfirm"
          class="pwd"
          type="password"
          placeholder="Confirm Password"
        />
      </div>
      <div>
        <span class="register-btn" @click="registerFunc">Register</span>
      </div>
      <div class="tip">
        <p>
          Already have an account？<span class="no-act" @click="toDoLogin"
            >Back to Login</span
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script>
const DELAY_TIME = 1300;
import request from "@/utils/request.js";
import md5 from "js-md5";
import Logo from "@/components/Logo.vue";
export default {
  name: "Register",
  components: { Logo },
  data() {
    return {
      act: "", // 账号
      pwd: "", // 密码
      pwdConfirm: "", // 确认密码
      name: "" // 用户名
    };
  },
  methods: {
    // 返回登录页面
    toDoLogin() {
      this.$router.push("/login");
    },
    async registerFunc() {
      if (!this.act || !this.pwd || !this.pwdConfirm || !this.name) {
        this.$message({
          message: "Account number, password or username cannot be empty",
          type: "error"
        });
        return;
      }
      if (this.pwd !== this.pwdConfirm) {
        this.$message({
          message: "The passwords entered before and after are inconsistent",
          type: "error"
        });
        return;
      }
      const hashedPwd = md5(md5(this.pwd));
      const paramDTO = {
        userAccount: this.act,
        userPwd: hashedPwd,
        userName: this.name
      };
      try {
        const { data } = await request.post(`user/register`, paramDTO);
        if (data.code !== 200) {
          this.$message({
            message: "Registration failed",
            type: "error"
          });

          return;
        }
        this.$message({
          message: "Successful registration",
          type: "success"
        });

        // 根据角色延迟跳转
        setTimeout(() => {
          this.$router.push("/login");
        }, DELAY_TIME);
      } catch (error) {
        console.error("注册请求错误:", error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
* {
  user-select: none;
}

.register-containel {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to right, rgb(7, 109, 219), rgb(119, 139, 220));
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .register-panel {
    margin: 0 auto;
    width: 293px;
    height: auto;
    padding: 40px 30px 16px 30px;
    border-radius: 10px;
    background-color: rgb(255, 255, 255);

    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);

    .logo {
      display: flex;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
    }

    .act,
    .pwd {
      margin: 8px 0;
      height: 53px;
      line-height: 53px;
      width: 100%;
      padding: 0 8px;
      background-color: rgb(251, 251, 251);
      box-sizing: border-box;
      border: 1px solid rgb(251, 251, 251);
      border-radius: 5px;
      font-weight: 800;
      font-size: 14px;
      padding: 0 15px;
      margin-top: 13px;
    }

    .act:focus,
    .pwd:focus {
      outline: none;
      background-color: rgb(242, 243, 244);
      transition: 1.2s;
    }

    .role {
      display: inline-block;
      color: rgb(30, 102, 147);
      font-size: 14px;
      padding-right: 10px;
    }
  }

  .register-btn {
    display: inline-block;
    text-align: center;
    border-radius: 3px;
    margin-top: 20px;
    height: 43px;
    line-height: 43px;
    width: 100%;
    background-color: rgb(101, 103, 193);
    font-size: 14px !important;
    border: none;
    color: rgb(250, 250, 250);
    padding: 0 !important;
    cursor: pointer;
    user-select: none;
  }

  .tip {
    margin: 20px 0;

    p {
      padding: 3px 0;
      font-size: 14px;
      margin: 0;
      color: #647897;

      i {
        margin-right: 3px;
      }

      span {
        color: #3b3c3e;
        border-radius: 2px;
        margin: 0 6px;
      }

      .no-act:hover {
        color: #568ed7;
        cursor: pointer;
      }
    }
  }
}
</style>
