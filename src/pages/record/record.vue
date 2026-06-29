<template>
  <view class="container">
    <view class="header">
      <text class="title">评分档案</text>
      <text class="subtitle">守护健康更安心</text>
    </view>
    <view class="health-score-card">
      <view class="health-score-header">
        <text class="score-title">健康评分</text>
        <u--button type="primary" shape="circle" @click="goToHealth" plain
          >开始评分</u--button
        >
      </view>
      <view class="score-cards">
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/tanghua.png" class="score-icon"></image>
            <text class="score-label">糖化</text>
          </view>
          <text class="score-value">{{ currentRecord.sugarScore || 0 }}分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/xieya.png" class="score-icon"></image>
            <text class="score-label">血压</text>
          </view>
          <text class="score-value"
            >{{ currentRecord.pressureScore || 0 }}分</text
          >
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/xiezhi1.png" class="score-icon"></image>
            <text class="score-label">血脂</text>
          </view>
          <text class="score-value">{{ currentRecord.ldlScore || 0 }}分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/tizhong.png" class="score-icon"></image>
            <text class="score-label">体重</text>
          </view>
          <text class="score-value">{{ currentRecord.bmiScore || 0 }}分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/kongyan.png" class="score-icon"></image>
            <text class="score-label">控烟</text>
          </view>
          <text class="score-value"
            >{{ currentRecord.smokingScore || 0 }}分</text
          >
        </view>
      </view>
      <view class="total-score">
        <text class="total-label">总评分</text>
        <text class="total-value">{{ currentRecord.totalScore || 0 }}分</text>
        <text class="risk-level" :class="riskLevelClass">{{
          currentRecord.riskLevel || "低风险"
        }}</text>
      </view>
      <!-- 展示评分二维码 -->
      <view class="risk-image-section" v-if="isLogin">
        <image
          :src="riskLevelImage"
          mode="aspectFit"
          class="risk-level-img"
        ></image>
        <text class="risk-image-text">{{ riskLevelText }}</text>
      </view>
    </view>
    <view class="history-section">
      <view class="history-header">
        <view class="history-title-bar">
          <view class="title-line"></view>
          <text class="history-title">历史评分记录</text>
        </view>
        <text class="history-count" v-if="historyRecords.length > 0"
          >共 {{ historyRecords.length }} 条</text
        >
      </view>
      <view class="history-list">
        <view
          class="history-item"
          v-for="record in historyRecords"
          :key="record.recordId"
          @click="viewRecordDetail(record.recordId)"
        >
          <view
            class="item-left-bar"
            :class="getRiskBarClass(record.totalScore)"
          ></view>
          <view class="history-main">
            <view class="history-meta">
              <text class="history-date">{{ record.createTime }}</text>
              <view
                class="risk-tag"
                :class="getRiskTagClass(record.totalScore)"
              >
                <text class="risk-tag-text">{{
                  getRiskLabel(record.totalScore)
                }}</text>
              </view>
            </view>
            <view class="history-score-row">
              <text class="history-score-label">总评分</text>
              <text class="history-score-value">{{
                record.totalScore || 0
              }}</text>
              <text class="history-score-unit">分</text>
            </view>
          </view>
          <view class="item-arrow">
            <view class="arrow-icon"></view>
          </view>
        </view>
        <view class="empty-state" v-if="historyRecords.length === 0">
          <view class="empty-icon-wrap">
            <uni-icons type="document" size="48" color="#d9d9d9"></uni-icons>
          </view>
          <text class="empty-text">暂无评分记录</text>
          <text class="empty-subtext">完成首次评分后将在此展示</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";

const currentRecord = ref({});
const historyRecords = ref([]);
const patientId = ref(null);

const isLogin = ref(false);

onMounted(() => {
  isLogin.value = uni.getStorageSync("isLogin") || false;
});

// 风险等级样式类
const riskLevelClass = computed(() => {
  const level = currentRecord.value.riskLevel || "";
  if (level.includes("高")) return "high";
  if (level.includes("中")) return "medium";
  return "low";
});

// 风险等级图片
const riskLevelImage = computed(() => {
  const totalScore = currentRecord.value.totalScore || 0;
  if (totalScore <= 1) {
    return "/static/img/11.jpeg"; // 低危：0-1 分
  } else if (totalScore <= 4) {
    return "/static/img/22.jpeg"; // 中危：2-4 分
  } else if (totalScore <= 7) {
    return "/static/img/33.jpeg"; // 高危：5-7 分
  } else {
    return "/static/img/44.jpeg"; // 很高危：8-10 分
  }
});

// 风险等级文字
const riskLevelText = computed(() => {
  const totalScore = currentRecord.value.totalScore || 0;
  if (totalScore <= 1) {
    return "低危：0-1 分";
  } else if (totalScore <= 4) {
    return "中危：2-4 分";
  } else if (totalScore <= 7) {
    return "高危：5-7 分";
  } else {
    return "很高危：8-10 分";
  }
});

// 获取历史评分记录
const fetchHistoryRecords = (patientId) => {
  console.log("patientId===获取评分记录", patientId);
  if (!patientId) {
    // 没有 patientId，清空历史记录（不显示错误提示，因为在 getPatientId 中已经处理）
    historyRecords.value = [];
    currentRecord.value = {};
    return;
  }

  uni.request({
    url: `https://yiliao.admin.php7788.com/prod-api/system/score/record/list?patientId=${patientId}`,
    method: "GET",
    header: {
      Authorization: "Bearer " + uni.getStorageSync("token"),
    },
    success: (res) => {
      console.log(res, "res=====历史评分记录");
      if (res.data.code === 200) {
        const allRecords = res.data.rows || [];
        // 最多展示前 10 条
        historyRecords.value = allRecords.slice(0, 10);
        currentRecord.value = allRecords[0] || {};
      }
    },
    fail: () => {
      uni.showToast({
        title: "获取历史评分记录失败",
        icon: "none",
      });
    },
  });
};

// 获取患者 ID
const getPatientId = () => {
  const token = uni.getStorageSync("token");
  const userInfo = uni.getStorageSync("userInfo");

  console.log("userInfo:", userInfo);

  // 先检查是否登录
  if (!token || !userInfo) {
    // 未登录---清空历史记录
    historyRecords.value = [
      {
        id: 0,
        totalScore: 0,
        riskLevel: "",
        createTime: "",
        sugarScore: 0,
        pressureScore: 0,
        ldlScore: 0,
        bmiScore: 0,
        smokingScore: 0,
      },
    ];
    currentRecord.value = {};
    return;
  }

  // 从 userInfo 中直接获取 patientId（userInfo 本身就是数据对象，不需要访问 .data）
  patientId.value = userInfo?.patientId || null;
  console.log("patientId:", patientId.value);

  // 如果是医生账号（userType === 0），可能没有 patientId
  if (userInfo.userType === 0 && !patientId.value) {
    // 医生账号，暂时显示空记录
    historyRecords.value = [
      {
        id: 0,
        totalScore: 0,
        riskLevel: "",
        createTime: "",
        sugarScore: 0,
        pressureScore: 0,
        ldlScore: 0,
        bmiScore: 0,
        smokingScore: 0,
      },
    ];
    currentRecord.value = {};
    return;
  }

  // 患者账号，获取历史记录
  fetchHistoryRecords(patientId.value);
};

onShow(() => {
  // 获取 patientId
  getPatientId();
});

const goToHealth = () => {
  // 判断是否登录
  const token = uni.getStorageSync("token");
  const userInfo = uni.getStorageSync("userInfo");

  if (!token || !userInfo) {
    uni.showToast({
      title: "请先登录",
      icon: "none",
    });
    setTimeout(() => {
      uni.navigateTo({
        url: "/packageA/login/login",
      });
    }, 1500);
  }

  // 判断是否为医生端
  const userType = userInfo?.userType ?? userInfo?.data?.userType;
  if (userType === 0) {
    uni.showToast({
      title: "医生端无法使用此功能",
      icon: "none",
    });
    return;
  }

  uni.navigateTo({
    url: "/packageA/health/health",
  });
};

// 根据总分获取风险等级样式
const getRiskBarClass = (score) => {
  if (score >= 8) return "bar-high";
  if (score >= 5) return "bar-medium-high";
  if (score >= 2) return "bar-medium";
  return "bar-low";
};

const getRiskTagClass = (score) => {
  if (score >= 8) return "tag-high";
  if (score >= 5) return "tag-medium-high";
  if (score >= 2) return "tag-medium";
  return "tag-low";
};

const getRiskLabel = (score) => {
  if (score >= 8) return "很高危";
  if (score >= 5) return "高危";
  if (score >= 2) return "中危";
  return "低危";
};

// 查看评分详情
const viewRecordDetail = (recordId) => {
  console.log(recordId, "recordId1233333=====");
  uni.request({
    url: `https://yiliao.admin.php7788.com/prod-api/system/score/record/${recordId}`,
    method: "GET",
    header: {
      Authorization: "Bearer " + uni.getStorageSync("token"),
    },
    success: (res) => {
      if (
        res.statusCode === 200 &&
        (res.data.code === 200 || res.data.code === 0)
      ) {
        const record = res.data.data;
        const content = `
            糖化：${record.sugarScore || 0}分
            血压：${record.pressureScore || 0}分
            血脂：${record.ldlScore || 0}分
            体重：${record.bmiScore || 0}分
            吸烟：${record.smokingScore || 0}分
            总评分：${record.totalScore || 0}分
            风险等级：${record.riskLevel || "-"}
                    `.trim();
        uni.showModal({
          title: "评分详情",
          content: content,
          showCancel: false,
        });
      }
    },
    fail: () => {
      uni.showToast({
        title: "获取详情失败",
        icon: "none",
      });
    },
  });
};
</script>

<style scoped>
.container {
  flex: 1;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background-color: #1e88e5;
  padding: 20px;
  text-align: center;
  color: white;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  display: block;
  background-color: #2196f3;
  padding: 5px 15px;
  border-radius: 20px;
  display: inline-block;
}

.health-score-card {
  background-color: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.health-score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.score-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  width: 120%;
}

.score-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: space-between;
}

.score-card {
  width: 33%;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.icon-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-icon {
  width: 24px;
  height: 24px;
}

.score-label {
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.score-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.total-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f0f8ff;
  border-radius: 8px;
  margin-top: 20px;
}

.total-label {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.total-value {
  font-size: 24px;
  font-weight: bold;
  color: #1e88e5;
}

.risk-level {
  font-size: 16px;
  font-weight: bold;
  padding: 5px 15px;
  border-radius: 20px;
}

.risk-level.high {
  background-color: #ffcccc;
  color: #ff0000;
}

.risk-level.medium {
  background-color: #fff3cd;
  color: #ffc107;
}

.risk-level.low {
  background-color: #d4edda;
  color: #28a745;
}

/* 风险等级图片区域 */
.risk-image-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  text-align: center;
}

.risk-level-img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
}

.risk-image-text {
  display: block;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.history-section {
  margin-top: 20px;
  background-color: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-title-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-line {
  width: 4px;
  height: 18px;
  background-color: #1e88e5;
  border-radius: 2px;
}

.history-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.history-count {
  font-size: 13px;
  color: #999;
  background-color: #f5f5f5;
  padding: 4px 10px;
  border-radius: 10px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  padding: 14px 12px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.history-item:active {
  background-color: #f8f9fa;
  transform: scale(0.99);
}

.item-left-bar {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  margin-right: 12px;
  flex-shrink: 0;
}

.bar-low {
  background-color: #52c41a;
}

.bar-medium {
  background-color: #faad14;
}

.bar-medium-high {
  background-color: #fa8c16;
}

.bar-high {
  background-color: #f5222d;
}

.history-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.history-date {
  font-size: 13px;
  color: #999;
}

.risk-tag {
  padding: 2px 8px;
  border-radius: 6px;
}

.risk-tag-text {
  font-size: 11px;
  font-weight: 500;
}

.tag-low {
  background-color: #f6ffed;
}

.tag-low .risk-tag-text {
  color: #52c41a;
}

.tag-medium {
  background-color: #fffbe6;
}

.tag-medium .risk-tag-text {
  color: #faad14;
}

.tag-medium-high {
  background-color: #fff7e6;
}

.tag-medium-high .risk-tag-text {
  color: #fa8c16;
}

.tag-high {
  background-color: #fff1f0;
}

.tag-high .risk-tag-text {
  color: #f5222d;
}

.history-score-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.history-score-label {
  font-size: 13px;
  color: #666;
}

.history-score-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e88e5;
  line-height: 1;
}

.history-score-unit {
  font-size: 12px;
  color: #999;
}

.item-arrow {
  margin-left: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 50%;
}

.arrow-icon {
  width: 8px;
  height: 8px;
  border-top: 2px solid #c0c4cc;
  border-right: 2px solid #c0c4cc;
  transform: rotate(45deg);
}

.empty-state {
  text-align: center;
  padding: 50px 0;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.empty-text {
  font-size: 15px;
  color: #666;
  font-weight: 500;
  display: block;
}

.empty-subtext {
  font-size: 13px;
  color: #bbb;
  margin-top: 8px;
  display: block;
}
</style>
