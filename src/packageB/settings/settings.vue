<template>
  <view class="container">
    <!-- 基本信息 -->
    <view class="section">
      <text class="section-title">基本信息</text>
      <view class="form-list">
        <view class="form-item">
          <text class="form-label required">患者姓名</text>
          <input
            type="text"
            v-model="form.patientName"
            placeholder="请输入患者姓名"
            class="form-input"
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
            type="number"
            v-model="form.age"
            placeholder="请输入年龄"
            class="form-input"
          />
        </view>
        <view class="form-item">
          <text class="form-label required">联系电话</text>
          <input
            type="number"
            v-model="form.phone"
            placeholder="请输入联系电话"
            class="form-input"
            maxlength="11"
          />
        </view>
        <view class="form-item">
          <text class="form-label">身高(cm)</text>
          <input
            type="digit"
            v-model="form.height"
            placeholder="请输入身高"
            class="form-input"
          />
        </view>
        <view class="form-item">
          <text class="form-label">体重(kg)</text>
          <input
            type="digit"
            v-model="form.weight"
            placeholder="请输入体重"
            class="form-input"
          />
        </view>
        <view v-if="form.userType !== 0" class="form-item">
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
            @change="onDoctorChange"
            v-if="doctorDisabled"
          >
            <view class="picker-value">{{ doctorText }}</view>
          </picker>
          <view v-else>{{ doctorText }}</view>
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
      <button class="save-btn" @click="saveForm">保存基本信息</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";

const baseUrl = "https://yiliao.admin.php7788.com/prod-api";

const doctorList = ref([]);

const form = ref({
  patientId: undefined,
  patientName: "",
  gender: "",
  age: "",
  phone: "",
  height: "",
  weight: "",
  visitTime: "",
  doctorId: undefined,
  doctorName: "",
  address: "",
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

const doctorNames = computed(() => doctorList.value.map((d) => d.userName));
const doctorDisabled = ref(false);
const doctorIndex = computed(() => {
  const idx = doctorList.value.findIndex(
    (d) => d.userId === form.value.doctorId,
  );
  return idx >= 0 ? idx : 0;
});
const doctorText = computed(() => {
  const doctor = doctorList.value.find((d) => d.userId === form.value.doctorId);
  return doctor?.userName || "请选择主治医师";
});

const onDoctorChange = (e) => {
  if (doctorDisabled.value) return;
  const doctor = doctorList.value[e.detail.value];
  if (doctor) {
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
      if (res.data && res.data.code === 200) {
        doctorList.value = res.data.rows || res.data.data || [];
      }
    },
    fail: () => {
      doctorList.value = [];
    },
  });
};

const getPatientInfo = () => {
  const userInfo = uni.getStorageSync("userInfo");
  let userId = "";
  let patientId = "";
  if (userInfo?.userType == 0) {
    userId = userInfo?.userId;
  } else if (userInfo?.userType == 1) {
    patientId = userInfo?.patientId;
  }
  if (!userId && !patientId) {
    uni.showToast({ title: "用户ID不能为空", icon: "none" });
    return;
  };
  uni.request({
    url: `${baseUrl}/system/user/list`,
    method: "GET",
    data: { pageNum: 1, pageSize: 1, ...(userInfo?.userType == 0 ? { userId } : { patientId }) },
    header: { Authorization: uni.getStorageSync("token") || "" },
    success: (res) => {
      if (res.data && res.data.code === 200) {
        console.log(res, "ressss====查询患者信息");
        const rows = res.data.rows || [];
        if (rows.length > 0) {
          const data = rows[0];
          form.value = {
            patientId: data.patientId,
            patientName: data.patientName || "",
            gender: data.gender || "",
            age: data.age || "",
            phone: data.phone || "",
            height: data.height || "",
            weight: data.weight || "",
            visitTime: data.visitTime || "",
            doctorId: data.userId,
            doctorName: data.doctorName || "",
            address: data.address || "",
          };
          initDateIndex(form.value.visitTime);
          // 只有超级管理员允许修改主治医师
          const nickName = userInfo?.nickName || '';
          doctorDisabled.value = nickName !== '超级管理员';

        }
      }
    },
  });
};

const saveForm = () => {
  if (!form.value.patientName) {
    uni.showToast({ title: "患者姓名不能为空", icon: "none" });
    return;
  }
  if (!form.value.phone) {
    uni.showToast({ title: "联系电话不能为空", icon: "none" });
    return;
  }

  uni.showLoading({ title: "保存中...", mask: true });

  const payload = {
    ...form.value,
    userId: form.value.doctorId,
    // userId: form.value.doctorId,
  };

  uni.request({
    url: `${baseUrl}/system/patient/updatePatientInformation`,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: uni.getStorageSync("token") || "",
    },
    data: payload,
    success: (res) => {
      uni.hideLoading();
      if (res.data && res.data.code == 200) {
        uni.showToast({ title: "保存成功", icon: "success" });
        setTimeout(() => {
          uni.switchTab({ url: "/pages/profile/profile" });
        }, 1500);
      } else {
        uni.showToast({ title: res.data?.msg || "保存失败", icon: "none" });
      }
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: "保存失败", icon: "none" });
    },
  });
};

onShow(async () => {
  await getDoctorList();
  await getPatientInfo();
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40px;
}

/* 区块 */
.section {
  background-color: white;
  margin: 15px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

/* 表单列表 */
.form-list {
  margin-bottom: 20px;
}

.form-item {
  display: flex;
  align-items: flex-start;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 90px;
  font-size: 15px;
  color: #666;
  flex-shrink: 0;
}

.form-label.required::before {
  content: "*";
  color: #ff4d4f;
  margin-right: 4px;
}

.form-input {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.form-picker {
  flex: 1;
}

.picker-value {
  font-size: 15px;
  color: #333;
}

.picker-value.disabled {
  color: #999;
}

.form-textarea {
  flex: 1;
  font-size: 15px;
  color: #333;
  height: 80px;
  padding: 8px 0;
}

/* 保存按钮 */
.save-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-radius: 22px;
  border: none;
  margin-top: 10px;
}

.save-btn::after {
  border: none;
}

.save-btn:active {
  opacity: 0.9;
}
</style>
