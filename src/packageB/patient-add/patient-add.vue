<template>
  <view class="container">
    <view class="card">
      <view class="card-title">患者信息</view>
      <view class="form-item">
        <text class="form-label required">患者姓名</text>
        <input
          class="form-input"
          v-model="form.patientName"
          placeholder="请输入患者姓名"
        />
      </view>
      <view class="form-item">
        <text class="form-label required">性别</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="genderOptions"
          :value="genderIndex"
          @change="onGenderChange"
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
        />
      </view>
      <view class="form-item">
        <text class="form-label required">联系电话</text>
        <input
          class="form-input"
          type="number"
          v-model="form.phone"
          placeholder="请输入联系电话"
        />
      </view>
      <view class="form-item">
        <text class="form-label">身高(cm)</text>
        <input
          class="form-input"
          type="digit"
          v-model="form.height"
          placeholder="请输入身高"
        />
      </view>
      <view class="form-item">
        <text class="form-label">体重(kg)</text>
        <input
          class="form-input"
          type="digit"
          v-model="form.weight"
          placeholder="请输入体重"
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
        >
          <view class="picker-value">{{
            form.visitTime || "请选择就诊时间"
          }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">主治医师</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="doctorNames"
          :value="doctorIndex"
          :disabled="true"
          @change="onDoctorChange"
        >
          <view class="picker-value">{{ doctorText }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">地址</text>
        <textarea
          class="form-textarea"
          v-model="form.address"
          placeholder="请输入地址"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="btn-group">
      <button class="btn submit" @click="submitForm">确 定</button>
      <button class="btn cancel" @click="goBack">取 消</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const baseUrl = "https://yiliao.admin.php7788.com/prod-api";

const userInfo = uni.getStorageSync("userInfo");
const currentUserId = userInfo?.userId || userInfo?.user?.userId;
const currentUserName = userInfo?.userName || userInfo?.user?.userName;

const form = ref({
  patientName: "",
  gender: "",
  age: "",
  height: "",
  weight: "",
  phone: "",
  address: "",
  visitTime: "",
  doctorId: currentUserId,
  doctorName: currentUserName,
});

// 性别选项
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

// 日期选择
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

const initDateIndex = () => {
  const now = new Date();
  dateIndex.value = [
    years.indexOf(now.getFullYear() + "年") || 0,
    now.getMonth(),
    now.getDate() - 1,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
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

// 医生列表
const doctorList = ref([]);
const doctorNames = computed(() => {
  return ["请选择主治医师", ...doctorList.value.map((d) => d.userName)];
});
const doctorIndex = computed(() => {
  if (!form.value.doctorId) return 0;
  const idx = doctorList.value.findIndex(
    (d) => d.userId === form.value.doctorId
  );
  return idx >= 0 ? idx + 1 : 0;
});
const doctorText = computed(() => {
  const text = doctorNames.value[doctorIndex.value];
  return text === "请选择主治医师" && form.value.doctorName
    ? form.value.doctorName
    : text;
});

const onDoctorChange = (e) => {
  const idx = e.detail.value;
  if (idx === 0) {
    form.value.doctorId = undefined;
    form.value.doctorName = "";
  } else {
    const doctor = doctorList.value[idx - 1];
    form.value.doctorId = doctor.userId;
    form.value.doctorName = doctor.userName;
  }
};

const getDoctorList = () => {
  uni.request({
    url: `${baseUrl}/system/user/querySysUserList`,
    method: "GET",
    header: { Authorization: uni.getStorageSync("token") || "" },
    success: (res) => {
      console.log(res, "医生列表不分页");
      if (res.data && res.data.code === 200) {
        doctorList.value = res.data.rows || [];
      }
    },
    fail: () => {
      doctorList.value = [];
    },
  });
};

const submitForm = () => {
  if (!form.value.patientName) {
    uni.showToast({ title: "患者姓名不能为空", icon: "none" });
    return;
  }
  if (!form.value.gender) {
    uni.showToast({ title: "请选择性别", icon: "none" });
    return;
  }
  if (!form.value.phone) {
    uni.showToast({ title: "联系电话不能为空", icon: "none" });
    return;
  }

  uni.showLoading({ title: "提交中..." });
  uni.request({
    url: `${baseUrl}/system/doctor/reception/save`,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: uni.getStorageSync("token") || "",
    },
    data: form.value,
    success: (res) => {
      uni.hideLoading();
      if (res.data && res.data.code === 200) {
        uni.showToast({ title: "新增成功", icon: "success" });
        setTimeout(() => {
          uni.switchTab({ url: "/pages/index/index" });
        }, 1500);
      } else {
        uni.showToast({ title: res.data?.msg || "新增失败", icon: "none" });
      }
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: "网络请求失败", icon: "none" });
    },
  });
};

const goBack = () => {
  uni.navigateBack();
};

onLoad(() => {
  initDateIndex();
  getDoctorList();
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 30px;
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
.form-picker {
  flex: 1;
  text-align: right;
}
.picker-value {
  font-size: 14px;
  color: #333;
  line-height: 22px;
}
.form-textarea {
  flex: 1;
  font-size: 14px;
  color: #333;
  height: 60px;
  text-align: right;
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
.cancel {
  background-color: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
}
</style>
