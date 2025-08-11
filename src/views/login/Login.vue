<template>
  <div class="login-container">
    <div class="login-panel">
      <img src="@/assets/img/login-bg.jpg" />
      <div class="right-login">
        <div>
          <h2>Intelligent Library Management System</h2>
        </div>
        <div class="text">
          <input v-model="act" class="act" placeholder="Username" />
        </div>
        <div class="text">
          <input
            v-model="pwd"
            class="pwd"
            type="password"
            placeholder="Password"
          />
        </div>
        <div>
          <span class="login-btn" @click="login">Login</span>
        </div>
        <div class="tip">
          <p>
            No account?<span class="no-act" @click="toDoRegister"
              >Register Now</span
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const DELAY_TIME = 1300;
import request from "@/utils/request.js";
import { setToken } from "@/utils/storage.js";
import md5 from "js-md5";
import Logo from "@/components/Logo.vue";
export default {
  name: "Login",
  components: { Logo },
  data() {
    return {
      act: "",
      pwd: "",
      colorLogo: "rgb(38,38,38)",
    };
  },
  methods: {
    // 跳转注册页面
    toDoRegister() {
      this.$router.push("/register");
    },
    async login() {
      if (!this.act || !this.pwd) {
        this.$message({
          message: "Account or password cannot be empty",
          type: "error",
        });
        return;
      }
      const hashedPwd = md5(md5(this.pwd));
      const paramDTO = { userAccount: this.act, userPwd: hashedPwd };
      try {
        const { data } = await request.post(`user/login`, paramDTO);
        if (data.code !== 200) {
          this.$swal.fire({
            title: "Login Failed",
            text: "Wrong password",
            icon: "error",
            showConfirmButton: false,
            timer: DELAY_TIME,
          });
          return;
        }
        setToken(data.data.token);
        setTimeout(() => {
          const { role } = data.data;
          this.navigateToRole(role);
        }, DELAY_TIME);
      } catch (error) {
        console.error("登录请求错误:", error);
        this.$message.error("登录请求出错，请重试！");
      }
    },
    navigateToRole(role) {
      switch (role) {
        case 1:
          this.$router.push("/userManage");
          break;
        case 2:
          this.$router.push("/main");
          break;
        default:
          console.warn("未知的角色类型:", role);
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
* {
  user-select: none;
}

.login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);

  .login-panel {
    display: flex;
    border-top-left-radius: 10px;
    padding: 20px;

    .right-login {
      width: 400px;
      background-color: rgb(253, 253, 253);
      padding: 30px;
      border-radius: 5px;
    }
    img {
      width: 500px;
    }

    .logo {
      margin: 10px 0 30px 0;
    }

    .act,
    .pwd {
      margin: 8px 0;
      height: 50px;
      line-height: 50px;
      width: 100%;
      font-size: 14px !important;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      font-weight: 800;
      padding: 0 8px;
      background-color: rgb(248, 248, 248);
      box-sizing: border-box;
      border: 2px solid rgb(248, 248, 248);
      border-radius: 6px;
      padding: 0 15px;
      margin-top: 13px;
    }

    .act:focus,
    .pwd:focus {
      outline: none;
      //border: 2px solid rgb(16, 170, 209);
      transition: 1.2s;
      background-color: rgb(244, 244, 244);
    }

    .role {
      display: inline-block;
      color: rgb(30, 102, 147);
      font-size: 14px;
      padding-right: 10px;
    }
  }
  .login-btn:hover {
    background-color: rgb(39, 106, 208);
  }
  .login-btn {
    display: inline-block;
    text-align: center;
    border-radius: 40px;
    margin-top: 20px;
    height: 43px;
    line-height: 43px;
    width: 100%;

    font-size: 14px !important;
    border: none;
    color: white;
    padding: 0 !important;
    cursor: pointer;
    user-select: none;
    background: #667eea;
    &:hover,
    &:focus {
      // background: #09a57a;
      // background-color: #ffc200;
      background: #764ba2;
      color: #ffffff;
    }
  }

  .tip {
    margin: 20px 0;

    p {
      padding: 3px 0;
      margin: 0;
      font-size: 14px;
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
        color: #3e77c2;
        cursor: pointer;
      }
    }
  }
}
</style>
