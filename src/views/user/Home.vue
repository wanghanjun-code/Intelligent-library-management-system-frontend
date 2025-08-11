<template>
  <div class="menu-container">
    <div class="menu-side" :class="{ 'menu-side-narrow': flag }">
      <div style="display: flex; align-items: center; justify-content: center">
        <img
          src="../../assets/img/digital.png"
          style="width: 90px; height: 80px"
          alt=""
        />
      </div>
      <div>
        <div
          v-if="route.show"
          :style="{
            fontWeight: nowRoute.name === route.name ? '800' : '',
            backgroundColor:
              nowRoute.name === route.name ? 'rgb(247, 247, 247)' : ''
          }"
          class="item-route"
          @click="routerClick(route)"
          v-for="(route, index) in userRoutes"
          :key="index"
        >
          <i
            :style="{ fontWeight: nowRoute.name === route.name ? '800' : '' }"
            :class="route.icon"
          ></i>
          {{ route.name }}
        </div>
        <div class="item-route">
          <div class="info" @click="routerClickSelf">
            <img :src="userInfo.url" />
            {{ userInfo.name }}
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="content-section">
        <router-view></router-view>
      </div>
    </div>

    <!-- 悬浮智能推荐按钮 -->
    <el-button
      class="recommend-float-btn"
      type="primary"
      circle
      @click="recommendDialogVisible = true"
      icon="el-icon-user"
    >
    </el-button>
    <!-- 智能推荐对话框 -->
    <el-dialog
      title="Intelligent Recommendation"
      :visible.sync="recommendDialogVisible"
      width="650px"
      height="30px"
      :close-on-click-modal="false"
      append-to-body
      class="recommend-dialog-assistant"
      top="15vh"
    >
      <div class="recommend-messages" ref="recommendMessagesContainer">
        <div
          v-if="recommendMessages.length === 0"
          class="recommend-placeholder"
        >
          Please enter your needs, and the system will recommend books for you~
        </div>
        <div
          v-for="(msg, idx) in recommendMessages"
          :key="idx"
          :class="[
            'message',
            msg.type === 'user' ? 'user-message' : 'ai-message'
          ]"
        >
          <div class="message-content">
            <div class="message-text">{{ msg.content }}</div>
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>
      </div>
      <div class="recommend-dialog-divider"></div>
      <div class="recommend-dialog-input-row">
        <el-input
          v-model="recommendInput"
          type="textarea"
          :rows="2"
          placeholder="Please enter your recommendation needs..."
          class="recommend-input-assistant"
          @keyup.enter.native="sendRecommend"
        ></el-input>
        <el-button
          type="primary"
          class="recommend-send-btn-assistant"
          :loading="recommendLoading"
          @click="sendRecommend"
          >Send</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/utils/request.js";
import router from "@/router/index";
import { clearToken, getToken } from "@/utils/storage";
import AdminMenu from "@/components/VerticalMenu.vue";
import Logo from "@/components/Logo.vue";
import LevelHeader from "@/components/LevelHeader.vue";
export default {
  name: "Admin",
  components: {
    Logo,
    LevelHeader,
    AdminMenu
  },
  data() {
    return {
      selfPath: { name: "个人中心", path: "/mySelf" },
      userRoutes: [],
      activeIndex: "",
      userInfo: {
        id: null,
        url: "",
        name: "",
        role: null,
        email: ""
      },
      flag: false,
      nowRoute: {},
      tag: "留言板",
      bag: "rgb(255, 255, 255)",
      colorLogo: "#1c1c1c",
      bagMenu: "rgb(255, 255, 255)",
      dialogOperaion: false,
      recommendDialogVisible: false,
      recommendInput: "",
      recommendResult: "",
      recommendLoading: false,
      recommendMessages: []
    };
  },
  created() {
    let menus = router.options.routes.filter(route => route.path == "/user")[0];
    this.userRoutes = menus.children;

    this.tokenCheckLoad();
    this.menuOperationHistory();
    this.routerClick(this.userRoutes[0]);
  },

  methods: {
    routerClickSelf() {
      this.routerClick(this.selfPath);
    },
    routerClick(route) {
      console.log(route);

      this.handleRouteSelect(route);
    },
    async updateUserInfo() {
      try {
        const userUpdateDTO = {
          userAvatar: this.userInfo.url,
          userName: this.userInfo.name,
          userEmail: this.userInfo.email
        };
        const resposne = await this.$axios.put(`/user/update`, userUpdateDTO);
        const { data } = resposne;
        if (data.code === 200) {
          this.dialogOperaion = false;
          this.tokenCheckLoad();
          this.$swal.fire({
            title: "修改个人信息",
            text: data.msg,
            icon: "success",
            showConfirmButton: false,
            timer: 1000
          });
        }
      } catch (e) {
        this.dialogOperaion = false;
        this.$swal.fire({
          title: "修改个人信息异常",
          text: e,
          icon: "error",
          showConfirmButton: false,
          timer: 2000
        });
        console.error(`修改个人信息异常:${e}`);
      }
    },
    handleAvatarSuccess(res, file) {
      if (res.code !== 200) {
        this.$message.error(`头像上传异常`);
        return;
      }
      this.$message.success(`头像上传成功`);
      this.userInfo.url = res.data;
    },
    eventListener(event) {
      // 个人中心
      if (event === "center") {
        this.dialogOperaion = true;
      }
      // 退出登录
      if (event === "loginOut") {
        this.loginOut();
      }
    },
    async loginOut() {
      const confirmed = await this.$swalConfirm({
        title: "退出登录？",
        text: `推出后需重新登录？`,
        icon: "warning"
      });
      if (confirmed) {
        this.$swal.fire({
          title: "Logout successful",
          text: "Return to the login page after 1 second",
          icon: "success",
          showConfirmButton: false,
          timer: 1000
        });
        setTimeout(() => {
          clearToken();
          this.$router.push("/login");
        }, 1000);
      }
    },
    menuOperationHistory() {
      this.flag = sessionStorage.getItem("flag") === "true";
    },
    selectOperation(flag) {
      this.flag = flag;
    },
    handleRouteSelect(route) {
      if (this.nowRoute.name !== route.name) {
        this.nowRoute = route;
        this.$router.push(route.path);
      }
    },
    // Token检验
    async tokenCheckLoad() {
      try {
        const res = await request.get("user/auth");
        // 错误处理
        if (res.data.code === 400) {
          this.$message.error(res.data.msg);
          this.$router.push("/login");
          return;
        }
        // 用户信息赋值
        const {
          id,
          userAvatar: url,
          userName: name,
          userRole: role,
          userEmail: email
        } = res.data.data;
        this.userInfo = { id, url, name, role, email };
        sessionStorage.setItem("userInfo", JSON.stringify(this.userInfo));
        sessionStorage.setItem("userId", this.userInfo.id);
        // 根据角色解析路由
        const rolePath = role === 1 ? "/admin" : "/user";
        const targetMenu = router.options.routes.find(
          route => route.path === rolePath
        );
        if (targetMenu) {
          this.routers = targetMenu.children;
        } else {
          console.warn(`未找到与角色对应的路由：${rolePath}`);
        }
      } catch (error) {
        console.error("获取用户认证信息时发生错误:", error);
        this.$message.error("认证信息加载失败，请重试！");
      }
    },
    async sendRecommend() {
      if (!this.recommendInput.trim()) return;
      this.recommendLoading = true;
      // 保存用户消息
      this.recommendMessages.push({
        type: "user",
        content: this.recommendInput,
        time: new Date().toLocaleTimeString()
      });
      const userInput = this.recommendInput;
      this.recommendInput = "";
      try {
        const response = await fetch(
          "/api/book-manage-sys-api/v1.0/api/coze/recommend",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Token: getToken()
            },
            body: JSON.stringify({
              query: userInput,
              conversation_id: "",
              user: ""
            })
          }
        );
        const data = await response.json();
        if (data && data.messages) {
          const aiMessages = data.messages.filter(
            msg => msg.role === "assistant"
          );
          const mainAnswer = aiMessages.find(msg => msg.type === "answer");
          const aiContent = mainAnswer
            ? mainAnswer.content
            : "未获取到推荐内容";
          this.recommendMessages.push({
            type: "ai",
            content: aiContent,
            time: new Date().toLocaleTimeString()
          });
          this.recommendResult = aiContent;
        } else {
          this.recommendMessages.push({
            type: "ai",
            content: "推荐服务异常，请稍后重试",
            time: new Date().toLocaleTimeString()
          });
          this.recommendResult = "推荐服务异常，请稍后重试";
        }
      } catch (e) {
        this.recommendMessages.push({
          type: "ai",
          content: "推荐服务异常，请稍后重试",
          time: new Date().toLocaleTimeString()
        });
        this.recommendResult = "推荐服务异常，请稍后重试";
      } finally {
        this.recommendLoading = false;
        this.scrollToRecommendBottom();
      }
    },
    scrollToRecommendBottom() {
      this.$nextTick(() => {
        const container = this.$refs.recommendMessagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }
};
</script>
<style scoped lang="scss">
::v-deep .el-dialog__header {
  height: 50px;
  line-height: 50px;
  color: #bbb;
}
::v-deep .el-dialog__title {
  line-height: 24px;
  font-size: 18px;
  color: #303133;
  padding-left: 10px;
}

.menu-container {
  display: flex;
  height: 100vh;
  width: 100%;

  .item-route {
    padding: 12px 14px;
    box-sizing: border-box;
    margin-inline: 20px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    margin-block: 4px;
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 6px;

    i {
      font-size: 16px;
    }

    .info {
      display: flex;
      justify-content: left;
      align-items: center;
      gap: 6px;
      font-weight: 800;

      img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
    }
  }

  .item-route:hover {
    background-color: rgb(247, 247, 247);
  }

  .menu-side {
    width: 253px;
    min-width: 95px;
    height: 100vh;
    padding-top: 10px;
    box-sizing: border-box;
    transition: width 0.3s ease;
    border-right: 1px solid rgb(245, 245, 245);
    background-color: rgb(224, 195, 252);
  }

  .menu-side-narrow {
    width: 115px;
  }

  .main {
    flex-grow: 1;
    overflow-x: hidden;
    background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
    width: 1156px;

    .header-section {
      max-width: 100%;
      padding: 0 15px 0 0;
    }

    .content-section {
      overflow-x: hidden;
      flex-grow: 1;
      padding: 0 20px;
      box-sizing: border-box;
      overflow-y: auto;
    }
  }
}

.recommend-float-btn {
  position: fixed;
  right: 50px;
  bottom: 150px;
  z-index: 9999;
  width: 56px;
  height: 56px;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%);
  border: none;
  border-radius: 50%;
  transition: box-shadow 0.2s;
}
.recommend-float-btn:hover {
  box-shadow: 0 4px 24px rgba(161, 140, 209, 0.4);
}

:deep(.recommend-dialog-assistant) {
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(161, 140, 209, 0.1);
  background: #fff;
  height: 70vh;
  display: flex;
  flex-direction: column;
}
:deep(.recommend-dialog-assistant) .el-dialog__header {
  border-bottom: none;
  font-size: 18px;
  font-weight: bold;
  color: #222;
  padding-bottom: 0;
}
:deep(.recommend-dialog-assistant) .el-dialog__body {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.recommend-messages {
  flex: 1;
  overflow-y: auto;
  /* margin-top: 10px; */
  padding: 20px 18px 0 18px;
  background-color: #f5f7fa;
  border-radius: 4px;
  height: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.message {
  margin-bottom: 0;
  display: flex;
}
.user-message {
  justify-content: flex-end;
}
.ai-message {
  justify-content: flex-start;
}
.message-content {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 8px;
  position: relative;
}
.user-message .message-content {
  background-color: #409eff;
  color: white;
}
.ai-message .message-content {
  background-color: white;
  border: 1px solid #dcdfe6;
}
.message-text {
  margin-bottom: 5px;
  word-break: break-word;
  white-space: pre-wrap;
  font-size: 15px;
}
.recommend-placeholder {
  color: #bbb;
  font-size: 14px;
  padding: 10px 0 0 2px;
}
.recommend-dialog-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 16px 0 0 0;
  width: 100%;
}
.recommend-dialog-input-row {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px 16px 16px;
}
:deep(.recommend-input-assistant .el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e0c3fc;
  background: #f7f8fa;
  font-size: 14px;
  color: #6c3483;
  min-height: 32px !important;
  padding: 6px 10px;
}
:deep(.recommend-input-assistant .el-textarea__inner:focus) {
  border-color: #a18cd1;
}
.recommend-send-btn-assistant {
  background: linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%);
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  min-width: 70px;
  min-height: 32px;
  box-shadow: 0 1px 4px rgba(161, 140, 209, 0.1);
  transition: background 0.2s, box-shadow 0.2s;
  margin-left: 4px;
  padding: 0 14px;
}
.recommend-send-btn-assistant:hover {
  background: linear-gradient(90deg, #8ec5fc 0%, #e0c3fc 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(161, 140, 209, 0.18);
}
</style>
