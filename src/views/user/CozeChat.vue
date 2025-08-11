<template>
  <div class="coze-chat">
    <el-card class="chat-container">
      <div slot="header" class="clearfix">
        <span>Coze AI 智能助手</span>
      </div>

      <div class="chat-messages" ref="messageContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="[
            'message',
            message.type === 'user' ? 'user-message' : 'ai-message'
          ]"
        >
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="请输入您想咨询的问题..."
          @keyup.enter.native="sendMessage"
        ></el-input>
        <el-button type="primary" @click="sendMessage" :loading="loading">{{
          loading ? "Sending..." : "Send"
        }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getToken } from "@/utils/storage.js";

export default {
  name: "CozeChat",
  data() {
    return {
      messages: [],
      inputMessage: "",
      loading: false,
      botId: "7512327128038719539", // Coze bot ID
      userId: "10086", // 用户ID
      apiKey:
        "pat_zlFA2c3TPeuMw9kDZq1gZCJlKxfJulUJ0w3ZU9mwItx0aN1v8A8tELJbnBpxkDY9" // 替换为你的 API 密钥
    };
  },
  methods: {
    async sendMessage() {
      if (!this.inputMessage.trim()) return;

      // 添加用户消息
      this.messages.push({
        type: "user",
        content: this.inputMessage,
        time: new Date().toLocaleTimeString()
      });

      const userMessage = this.inputMessage;
      this.inputMessage = "";
      this.loading = true;

      try {
        const requestBody = [
          {
            content_type: "text",
            content: {
              text: userMessage,
              image_url: null,
              file_url: null
            }
          }
        ];

        console.log("请求体:", JSON.stringify(requestBody, null, 2));

        const response = await this.$axios.post("/api/coze/chat", requestBody, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`
          }
        });

        console.log("响应数据:", response.data);

        if (response.data && response.data.response) {
          // 添加AI回复
          this.messages.push({
            type: "ai",
            content: response.data.response,
            time: new Date().toLocaleTimeString()
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Coze 聊天错误:", error);
        this.$message.error("抱歉，获取AI回复失败，请稍后重试");
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    scrollToBottom() {
      const container = this.$refs.messageContainer;
      container.scrollTop = container.scrollHeight;
    }
  },
  mounted() {
    // 添加欢迎消息
    this.messages.push({
      type: "ai",
      content:
        "您好！我是Coze AI智能助手，很高兴为您服务。请问有什么我可以帮您的吗？",
      time: new Date().toLocaleTimeString()
    });
  }
};
</script>

<style scoped>
.coze-chat {
  padding: 20px;
  height: 100%;
}

.chat-container {
  height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.message {
  margin-bottom: 20px;
  display: flex;
}

.user-message {
  justify-content: flex-end;
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
}

.message-time {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input .el-button {
  align-self: flex-end;
}
</style>
