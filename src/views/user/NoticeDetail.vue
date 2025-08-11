<template>
  <div class="container">
    <div class="container-top">
      <div class="return-page" @click="returnPage">
        <i class="el-icon-back"></i>
      </div>
      <div class="title">{{ notice.name }}</div>
    </div>
    <div class="container-buttom">
      <div v-html="notice.content"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notice: {}
    };
  },
  created() {
    this.loadNoticeInfo();
  },
  methods: {
    returnPage() {
      this.$router.go(-1);
    },
    loadNoticeInfo() {
      const jsonNiticeInfo = sessionStorage.getItem("noticeInfo");
      this.notice = JSON.parse(jsonNiticeInfo);
    }
  }
};
</script>
<style scoped lang="scss">
.histort-content {
  background: white;
  border-radius: 10px;
  padding: 10px;
}
.container-buttom {
  padding-left: 50px;
}
.container {
  /* width: 800px; */
  margin: 30px auto;
  padding: 40px 30px;
  background: white;
  border-radius: 10px;
  padding: 10px;
  min-height: 90vh;

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
      font-size: 30px;
      font-weight: 800;
    }
  }
}
</style>
