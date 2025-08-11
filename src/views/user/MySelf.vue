<template>
  <div class="container">
    <div class="container-top">
      <div class="title">User Center</div>
    </div>
    <div class="item">
      <span
        :style="{
          fontWeight: tagSelected === tagItem ? '800' : '',
          color: tagSelected === tagItem ? 'rgb(51,51,51)' : '',
          backgroundColor: tagSelected === tagItem ? 'rgb(247, 247, 247)' : ''
        }"
        @click="condition(tagItem)"
        v-for="(tagItem, index) in tags"
        :key="index"
      >
        {{ tagItem }}
      </span>
    </div>
    <div v-if="tagSelected === 'Edit Profile'">
      <Self />
    </div>
    <div v-else-if="tagSelected === 'Change Password'">
      <ResetPwd />
    </div>
    <div v-else-if="tagSelected === 'Log Out'">
      <el-result
        icon="warning"
        title="Log Out"
        subTitle="You will need to log in again after signing out."
      >
        <template slot="extra">
          <span class="loginout" @click="loginout">Confirm</span>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script>
import ResetPwd from "@/views/user/ResetPwd";
import Self from "@/views/user/Self";
export default {
  components: { ResetPwd, Self },
  data() {
    return {
      tags: ["Edit Profile", "Change Password", "Log Out"],
      // tags: ["修改资料", "退出登录"],
      tagSelected: "",
      defaultPath: "Edit Profile"
    };
  },
  created() {
    this.condition(this.defaultPath);
  },
  methods: {
    loginout() {
      sessionStorage.setItem("token", null);
      this.$router.push("/login");
    },
    condition(tag) {
      this.tagSelected = tag;
    },
    returnPage() {
      this.$router.go(-1);
    }
  }
};
</script>
<style scoped lang="scss">
.loginout {
  display: inline-block;
  background-color: rgb(51, 51, 51);
  color: rgb(245, 245, 245);
  border-radius: 5px;
  padding: 4px 30px;
  cursor: pointer;
}
.loginout:hover {
  background-color: rgb(35, 35, 35);
}
.item {
  width: 1050px;
  padding-block: 10px;
  margin-block: 20px;
  display: flex;
  justify-content: left;
  gap: 4px;

  span {
    font-size: 16px;
    cursor: pointer;
    display: inline-block;
    transition: all 0.2s;
    padding: 10px 20px;
    border-radius: 10px;
  }

  span:hover {
    background-color: rgb(246, 246, 246);
  }
}
.all-conent {
  background: white;
  height: 95vh;
  padding: 30px;
  border-radius: 10px;
  box-sizing: border-box;
}
.container {
  /* width: 1000px;
  margin: 0 auto;
  padding: 40px 30px; */
  /* background: white; */
  background: white;
  height: 95vh;
  padding: 30px;
  border-radius: 10px;
  box-sizing: border-box;
  margin-top: 20px;

  .container-top {
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 8px;

    .return-page {
      padding: 20px;
      border-radius: 5px;
      cursor: pointer;
    }

    .return-page:hover {
      background-color: rgb(248, 248, 248);
    }

    .title {
      font-size: 24px;
      font-weight: 800;
    }
  }
}
</style>
