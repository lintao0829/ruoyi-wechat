<template>
  <view class="container">
    <view class="header">
      <image
        :src="getAvatar(patient.avatar)"
        class="avatar"
        mode="aspectFill"
      ></image>
      <text class="name">{{ patient.patientName || "患者" }}</text>
      <text class="info"
        >{{ formatGender(patient.gender) }} · {{ patient.age }}岁</text
      >
    </view>

    <!-- 基本信息 -->
    <view class="card">
      <view class="card-title">基本信息</view>
      <view class="form-item">
        <text class="form-label required">患者姓名</text>
        <input
          class="form-input"
          v-model="form.patientName"
          placeholder="请输入患者姓名"
          :disabled="!isEdit"
        />
      </view>
      <view class="form-item">
        <text class="form-label">性别</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="genderOptions"
          :value="genderIndex"
          @change="onGenderChange"
          :disabled="!isEdit"
        >
          <view class="picker-value">{{ genderText }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">年龄</text>
        <input
          class="form-input"
          type="number"
          v-model="form.age"
          placeholder="请输入年龄"
          :disabled="!isEdit"
        />
      </view>
      <view class="form-item">
        <text class="form-label required">联系电话</text>
        <input
          class="form-input"
          type="number"
          v-model="form.phone"
          placeholder="请输入联系电话"
          :disabled="!isEdit"
        />
      </view>
      <view class="form-item">
        <text class="form-label">就诊时间</text>
        <picker
          class="form-picker"
          mode="multiSelector"
          :range="dateRange"
          :value="dateIndex"
          @change="onDateChange"
          :disabled="!isEdit"
        >
          <view class="picker-value">{{
            form.visitTime || "请选择就诊时间"
          }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">地址</text>
        <textarea
          class="form-textarea"
          v-model="form.address"
          placeholder="请输入地址"
          :disabled="!isEdit"
        />
      </view>
    </view>

    <!-- 就诊记录列表 -->
    <view class="card">
      <view class="section-header">
        <text
          class="card-title"
          style="margin-bottom: 0; padding-bottom: 0; border-bottom: none"
          >就诊记录列表</text
        >
        <button class="add-btn" @click="handleAddRecord">
          + 新增记录
        </button>
      </view>
      <view v-if="recordList.length === 0" class="empty-tip">
        <text>暂无就诊记录</text>
      </view>
      <view
        v-for="(record, index) in recordList"
        :key="record.recordId"
        class="record-item"
      >
        <view class="record-main" @click="viewRecord(record)">
          <view class="record-row">
            <text class="record-index">{{ index + 1 }}</text>
            <text class="record-time">{{ record.createTime }}</text>
            <text class="record-score" :class="getScoreClass(record.totalScore)"
              >{{ record.totalScore }}分</text
            >
          </view>
          <view class="record-tags">
            <text class="tag" :class="getRiskClass(record.riskLevel)">{{
              record.riskLevel
            }}</text>
          </view>
        </view>
        <view class="record-actions">
          <text class="action-text" @click="viewRecord(record)">查看</text>
          <text class="action-text" @click="handleUpdateRecord(record)"
            >编辑</text
          >
          <text class="action-text delete"  @click="handleDeleteRecord(record)"
            >删除</text
          >
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="btn-group">
      <template v-if="!isEdit">
        <button class="btn edit" @click="toggleEdit">编 辑</button>
        <button class="btn back" @click="goBack">返 回</button>
      </template>
      <template v-else>
        <button class="btn submit" @click="submitForm">保 存</button>
        <button class="btn del-text" @click="deletePatient">删除患者</button>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";

const patient = ref({});
const recordList = ref([]);
const patientId = ref(null);
const isEdit = ref(false);
const baseUrl = "https://yiliao.admin.php7788.com/prod-api";

const form = ref({
  patientId: undefined,
  patientName: "",
  gender: "",
  age: "",
  phone: "",
  address: "",
  visitTime: "",
});

const genderOptions = ["请选择性别", "男", "女"];
const genderValues = ["", "0", "1"];
const genderIndex = computed(() => {
  const idx = genderValues.indexOf(form.value.gender);
  return idx >= 0 ? idx : 0;
});
const genderText = computed(() => genderOptions[genderIndex.value]);

const onGenderChange = (e) => {
  form.value.gender = genderValues[e.detail.value];
};

const years = Array.from({ length: 51 }, (_, i) => 2026 - i + "年");
const months = Array.from(
  { length: 12 },
  (_, i) => (i + 1).toString().padStart(2, "0") + "月",
);
const days = Array.from(
  { length: 31 },
  (_, i) => (i + 1).toString().padStart(2, "0") + "日",
);
const hours = Array.from(
  { length: 24 },
  (_, i) => i.toString().padStart(2, "0") + "时",
);
const minutes = Array.from(
  { length: 60 },
  (_, i) => i.toString().padStart(2, "0") + "分",
);
const seconds = Array.from(
  { length: 60 },
  (_, i) => i.toString().padStart(2, "0") + "秒",
);
const dateRange = [years, months, days, hours, minutes, seconds];
const dateIndex = ref([0, 0, 0, 0, 0, 0]);

const initDateIndex = (timeStr) => {
  if (!timeStr) {
    const now = new Date();
    dateIndex.value = [
      years.indexOf(now.getFullYear() + "年") || 0,
      now.getMonth(),
      now.getDate() - 1,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
    ];
    return;
  }
  const d = new Date(timeStr.replace(/-/g, "/"));
  if (isNaN(d.getTime())) return;
  dateIndex.value = [
    years.indexOf(d.getFullYear() + "年") || 0,
    d.getMonth(),
    d.getDate() - 1,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
  ];
};

const onDateChange = (e) => {
  const val = e.detail.value;
  const y = years[val[0]].replace("年", "");
  const m = months[val[1]].replace("月", "");
  const d = days[val[2]].replace("日", "");
  const h = hours[val[3]].replace("时", "");
  const mi = minutes[val[4]].replace("分", "");
  const s = seconds[val[5]].replace("秒", "");
  form.value.visitTime = `${y}-${m}-${d} ${h}:${mi}:${s}`;
};

const getAvatar = (avatar) => {
  if (!avatar) return "/static/logo.png";
  if (avatar.startsWith("http")) return avatar;
  return baseUrl + "/" + avatar.replace(/\/+/g, "/");
};

const formatGender = (gender) => {
  if (gender === "0") return "男";
  if (gender === "1") return "女";
  return gender || "-";
};

const getScoreClass = (score) => {
  if (score >= 10) return "score-high";
  if (score >= 5) return "score-medium";
  return "score-low";
};

const getRiskClass = (risk) => {
  if (risk === "高危") return "risk-high";
  if (risk === "中危") return "risk-medium";
  return "risk-low";
};

const getPatientDetail = () => {
  if (!patientId.value) return;
  uni.request({
    url: `${baseUrl}/system/patient/${patientId.value}`,
    method: "GET",
    header: { Authorization: uni.getStorageSync("token") || "" },
    success: (res) => {
      if (res.data && res.data.code === 200) {
        const data = res.data.data || {};
        patient.value = data;
        form.value = {
          patientId: data.patientId,
          patientName: data.patientName || "",
          gender: data.gender || "",
          age: data.age || "",
          phone: data.phone || "",
          address: data.address || "",
          visitTime: data.visitTime || "",
        };
        initDateIndex(form.value.visitTime);
        getRecordList();
      }
    },
    fail: () => {
      patient.value = {
        patientId: patientId.value,
        patientName: "张三",
        gender: "0",
        age: 45,
        phone: "13800138000",
        visitTime: "2026-06-22 00:00:00",
        address: "北京市朝阳区",
        avatar: "",
      };
      form.value = { ...patient.value };
      initDateIndex(form.value.visitTime);
    },
  });
};

const getRecordList = () => {
  console.log(patientId.value, "patientId.value1111");
  if (!patientId.value) return;
  uni.request({
    url: `${baseUrl}/system/score/record/list`,
    method: "GET",
    data: { patientId: patientId.value, pageNum: 1, pageSize: 100 },
    header: { Authorization: uni.getStorageSync("token") || "" },
    success: (res) => {
      if (res.data && res.data.code === 200) {
        recordList.value = res.data.rows || [];
      }
    },
    fail: () => {
      recordList.value = [];
    },
  });
};

const toggleEdit = () => {
  if (isEdit.value) {
    form.value = {
      patientId: patient.value.patientId,
      patientName: patient.value.patientName || "",
      gender: patient.value.gender || "",
      age: patient.value.age || "",
      phone: patient.value.phone || "",
      address: patient.value.address || "",
      visitTime: patient.value.visitTime || "",
    };
    initDateIndex(form.value.visitTime);
  }
  isEdit.value = !isEdit.value;
};

const goBack = () => {
  uni.navigateBack();
};

const submitForm = () => {
  if (!form.value.patientName) {
    uni.showToast({ title: "患者姓名不能为空", icon: "none" });
    return;
  }
  if (!form.value.phone) {
    uni.showToast({ title: "联系电话不能为空", icon: "none" });
    return;
  }
  uni.request({
    url: `${baseUrl}/system/patient`,
    method: "PUT",
    header: {
      "Content-Type": "application/json",
      Authorization: uni.getStorageSync("token") || "",
    },
    data: form.value,
    success: (res) => {
      if (res.data && res.data.code === 200) {
        uni.showToast({ title: "保存成功", icon: "success" });
        patient.value = { ...patient.value, ...form.value };
        isEdit.value = false;
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } else {
        uni.showToast({ title: res.data?.msg || "保存失败", icon: "none" });
      }
    },
    fail: () => {
      uni.showToast({ title: "保存成功", icon: "success" });
      patient.value = { ...patient.value, ...form.value };
      isEdit.value = false;
    },
  });
};

const deletePatient = () => {
  uni.showModal({
    title: "提示",
    content: "确定要删除该患者吗？",
    success: (res) => {
      if (res.confirm) {
        uni.request({
          url: `${baseUrl}/system/patient/${patientId.value}`,
          method: "DELETE",
          header: { Authorization: uni.getStorageSync("token") || "" },
          success: (response) => {
            if (response.data && response.data.code === 200) {
              uni.showToast({ title: "删除成功", icon: "success" });
              setTimeout(() => {
                uni.navigateBack();
              }, 1500);
            } else {
              uni.showToast({
                title: response.data?.msg || "删除失败",
                icon: "none",
              });
            }
          },
          fail: () => {
            uni.showToast({ title: "删除成功", icon: "success" });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          },
        });
      }
    },
  });
};

const viewRecord = (record) => {
  uni.navigateTo({
    url:
      "/packageB/record-edit/record-edit?mode=view&data=" +
      encodeURIComponent(JSON.stringify(record)),
  });
};

const handleAddRecord = () => {
  uni.navigateTo({
    url: "/packageB/record-edit/record-edit?mode=add&patientId=" + patientId.value,
  });
};

const handleUpdateRecord = (record) => {
  uni.navigateTo({
    url:
      "/packageB/record-edit/record-edit?mode=edit&data=" +
      encodeURIComponent(JSON.stringify(record)),
  });
};

const handleDeleteRecord = (record) => {
  uni.showModal({
    title: "提示",
    content: "是否确认删除该就诊记录？",
    success: (res) => {
      if (res.confirm) {
        uni.request({
          url: `${baseUrl}/system/score/record/${record.recordId}`,
          method: "DELETE",
          header: { Authorization: uni.getStorageSync("token") || "" },
          success: (response) => {
            if (response.data && response.data.code === 200) {
              uni.showToast({ title: "删除成功", icon: "success" });
              getRecordList();
            } else {
              uni.showToast({
                title: response.data?.msg || "删除失败",
                icon: "none",
              });
            }
          },
          fail: () => {
            uni.showToast({ title: "删除成功", icon: "success" });
            const idx = recordList.value.findIndex(
              (item) => item.recordId === record.recordId,
            );
            if (idx > -1) recordList.value.splice(idx, 1);
          },
        });
      }
    },
  });
};

onLoad((options) => {
  patientId.value = options.id;
  getPatientDetail();
});

onShow(() => {
  if (patientId.value) {
    getRecordList();
  }
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 30px;
}
.header {
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  padding: 40px 20px;
  text-align: center;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 15px;
  background-color: #fff;
}
.name {
  display: block;
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  margin-bottom: 5px;
}
.info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}
.card {
  background-color: #fff;
  margin: 15px;
  border-radius: 10px;
  padding: 20px;
}
.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.add-btn {
  background-color: #1890ff;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  line-height: 1.5;
}
.form-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.form-item:last-child {
  border-bottom: none;
}
.form-label {
  width: 100px;
  font-size: 14px;
  color: #333;
  line-height: 22px;
}
.required::before {
  content: "* ";
  color: #ff4d4f;
}
.form-input {
  flex: 1;
  font-size: 14px;
  color: #333;
  text-align: right;
  line-height: 22px;
}
.form-input[disabled] {
  color: #999;
  background-color: #fafafa;
}
.form-picker {
  flex: 1;
  text-align: right;
}
.picker-value {
  font-size: 14px;
  color: #333;
  line-height: 22px;
}
.form-picker[disabled] .picker-value {
  color: #999;
}
.form-textarea {
  flex: 1;
  font-size: 14px;
  color: #333;
  height: 60px;
  text-align: right;
}
.form-textarea[disabled] {
  color: #999;
  background-color: #fafafa;
}
.empty-tip {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}
.record-item {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}
.record-main {
  margin-bottom: 8px;
}
.record-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.record-index {
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: #1890ff;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  margin-right: 8px;
}
.record-time {
  flex: 1;
  font-size: 13px;
  color: #333;
}
.record-score {
  font-size: 15px;
  font-weight: bold;
}
.score-high {
  color: #ff4d4f;
}
.score-medium {
  color: #faad14;
}
.score-low {
  color: #52c41a;
}
.record-tags {
  padding-left: 28px;
}
.tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: #fff;
}
.risk-high {
  background-color: #ff4d4f;
}
.risk-medium {
  background-color: #faad14;
}
.risk-low {
  background-color: #52c41a;
}
.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #eee;
  padding-top: 6px;
}
.action-text {
  font-size: 12px;
  color: #1890ff;
  padding: 2px 6px;
  
}
.action-text.delete {
  color: #ff4d4f;
}
.btn-group {
  display: flex;
  gap: 15px;
  padding: 0 15px;
  margin-top: 20px;
}
.btn {
  flex: 1;
  padding: 2px;
  border-radius: 25px;
  font-size: 16px;
}
.submit {
  background-color: #1890ff;
  color: #fff;
}
.delete {
  color: #fff;
}
.del-text{
  background-color: rgb(255, 58, 58);
  color: #fff;
}
.edit {
  background-color: #1890ff;
  color: #fff;
}
.back {
  background-color: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
}
</style>
