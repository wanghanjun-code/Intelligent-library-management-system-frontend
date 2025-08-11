<template>
  <div class="ai-assistant">
    <el-card
      class="chat-container"
      :body-style="{ padding: '0px', display: 'flex', flexDirection: 'column' }"
    >
      <div slot="header" class="clearfix">
        <span>Book intelligent analysis assistant</span>
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
          placeholder="Please enter your question...."
          @keyup.enter.native="sendMessage"
        ></el-input>
        <el-button type="primary" @click="sendMessage" :loading="loading"
          >Send</el-button
        >
      </div>
    </el-card>
  </div>
</template>

<script>
import { getToken } from "@/utils/storage.js";

export default {
  name: "AiAssistant",
  data() {
    return {
      messages: [],
      inputMessage: "",
      loading: false
    };
  },
  methods: {
    useFollowUp(question) {
      this.inputMessage = question;
      this.sendMessage();
    },
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
        // 调用后端AI接口
        const response = await fetch(
          "/api/book-manage-sys-api/v1.0/api/coze/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Token: getToken()
            },
            body: JSON.stringify({
              query: userMessage,
              conversation_id: "234",
              user: "user_123"
            })
          }
        );

        const data = await response.json();

        if (data && data.messages) {
          // 处理AI回复
          const aiMessages = data.messages.filter(
            msg => msg.role === "assistant"
          );
          const mainAnswer = aiMessages.find(msg => msg.type === "answer");
          const followUps = aiMessages
            .filter(msg => msg.type === "follow_up")
            .map(msg => msg.content);

          if (mainAnswer) {
            // Split the content by the common delimiters and join with newlines
            const formattedContent = mainAnswer.content
              .replace(
                /(\s*摘\s*要\s*:|\s*关键\s*词\s*:|\s*主\s*题\s*倾\s*向\s*:|\s*情\s*感\s*色\s*彩\s*:|\s*核\s*心\s*思\s*想\s*:)/g,
                "\n$1"
              )
              .trim();

            this.messages.push({
              type: "ai",
              content: formattedContent,
              followUps: followUps,
              time: new Date().toLocaleTimeString()
            });
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("AI chat error:", error);
        const errorMessage =
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : "获取AI回复失败，请稍后重试";
        this.$message.error(errorMessage);
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
        "Hello! I am the book smart assistant, is there anything I can help you with?",
      time: new Date().toLocaleTimeString()
    });
  }
};
</script>

<style scoped>
.ai-assistant {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Target el-card__body for flex layout */
::v-deep .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0px !important; /* Remove default padding */
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  /* margin-bottom: 20px; */ /* Removed */
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
  white-space: pre-wrap;
}

.follow-ups {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #dcdfe6;
}

.follow-up-title {
  font-size: 12px;
  color: hsl(220, 4%, 58%);
  margin-bottom: 5px;
}

.follow-up-item {
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
  padding: 5px 0;
  transition: color 0.3s;
}

.follow-up-item:hover {
  color: #66b1ff;
}

.message-time {
  font-size: 12px;
  color: #fff;
  text-align: right;
  margin-top: 5px;
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 10px 20px; /* Adjust padding */
  border-top: 1px solid #ebeef5; /* Add top border */
  background-color: #ffffff;
}

.chat-input .el-button {
  align-self: flex-end;
}
</style>
