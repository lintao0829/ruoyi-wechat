<template>
  <view class="container">
    <!-- 评分结果（仅查看模式） -->
    <view v-if="isView" class="score-section">
      <view class="score-title">评分结果</view>
      <view class="score-grid">
        <view class="score-item">
          <text class="score-num">{{ form.sugarScore || 0 }}</text>
          <text class="score-label">糖化得分</text>
        </view>
        <view class="score-item">
          <text class="score-num">{{ form.pressureScore || 0 }}</text>
          <text class="score-label">血压得分</text>
        </view>
        <view class="score-item">
          <text class="score-num">{{ form.ldlScore || 0 }}</text>
          <text class="score-label">血脂得分</text>
        </view>
        <view class="score-item">
          <text class="score-num">{{ form.bmiScore || 0 }}</text>
          <text class="score-label">BMI得分</text>
        </view>
        <view class="score-item">
          <text class="score-num">{{ form.smokingScore || 0 }}</text>
          <text class="score-label">吸烟得分</text>
        </view>
        <view class="score-item">
          <text class="score-num" :class="getScoreClass(form.totalScore)">{{ form.totalScore || 0 }}</text>
          <text class="score-label">总评分</text>
        </view>
      </view>
      <view class="risk-tag" :class="getRiskClass(form.riskLevel)">
        风险等级：{{ form.riskLevel || '-' }}
      </view>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">科室</text>
        <input class="form-input" v-model="form.department" placeholder="请输入科室" :disabled="isView" />
      </view>
      <!-- <view class="form-item">
        <text class="form-label">主治医生</text>
        <view class="form-input" style="text-align: right;" @click="showDoctorPicker" v-if="!isView">
          <text v-if="selectedDoctorNames">{{ selectedDoctorNames }}</text>
          <text v-else style="color: #999;">请选择主治医生</text>
        </view>
        <text v-else class="form-input" style="text-align: right; color: #333;">{{ selectedDoctorNames || '-' }}</text>
      </view> -->
      <view class="form-item">
        <text class="form-label required">糖化血红蛋白(%)</text>
        <view class="number-box" v-if="!isView">
          <text class="num-btn" @click="minus('sugarValue', 0.1, 1)">-</text>
          <input class="num-input" type="digit" v-model="form.sugarValue" />
          <text class="num-btn" @click="plus('sugarValue', 0.1, 1)">+</text>
        </view>
        <text v-else class="form-input" style="text-align: right;">{{ form.sugarValue }}</text>
      </view>
      <view class="form-item">
        <text class="form-label required">收缩压(mmHg)</text>
        <view class="number-box" v-if="!isView">
          <text class="num-btn" @click="minus('systolicPressure', 1)">-</text>
          <input class="num-input" type="number" v-model="form.systolicPressure" />
          <text class="num-btn" @click="plus('systolicPressure', 1)">+</text>
        </view>
        <text v-else class="form-input" style="text-align: right;">{{ form.systolicPressure }}</text>
      </view>
      <view class="form-item">
        <text class="form-label required">舒张压(mmHg)</text>
        <view class="number-box" v-if="!isView">
          <text class="num-btn" @click="minus('diastolicPressure', 1)">-</text>
          <input class="num-input" type="number" v-model="form.diastolicPressure" />
          <text class="num-btn" @click="plus('diastolicPressure', 1)">+</text>
        </view>
        <text v-else class="form-input" style="text-align: right;">{{ form.diastolicPressure }}</text>
      </view>
      <view class="form-item">
        <text class="form-label required">低密度脂蛋白(mmol/L)</text>
        <view class="number-box" v-if="!isView">
          <text class="num-btn" @click="minus('ldlValue', 0.01, 2)">-</text>
          <input class="num-input" type="digit" v-model="form.ldlValue" />
          <text class="num-btn" @click="plus('ldlValue', 0.01, 2)">+</text>
        </view>
        <text v-else class="form-input" style="text-align: right;">{{ form.ldlValue }}</text>
      </view>
      <view class="form-item">
        <text class="form-label required">身高(cm)</text>
        <view class="number-box" v-if="!isView">
          <text class="num-btn" @click="minus('height', 0.1, 1)">-</text>
          <input class="num-input" type="digit" v-model="form.height" />
          <text class="num-btn" @click="plus('height', 0.1, 1)">+</text>
        </view>
        <text v-else class="form-input" style="text-align: right;">{{ form.height }}</text>
      </view>
      <view class="form-item">
        <text class="form-label required">体重(kg)</text>
        <view class="number-box" v-if="!isView">
          <text class="num-btn" @click="minus('weight', 0.1, 1)">-</text>
          <input class="num-input" type="digit" v-model="form.weight" />
          <text class="num-btn" @click="plus('weight', 0.1, 1)">+</text>
        </view>
        <text v-else class="form-input" style="text-align: right;">{{ form.weight }}</text>
      </view>
      <view class="form-item">
        <text class="form-label required">吸烟支数</text>
        <view class="number-box" v-if="!isView">
          <text class="num-btn" @click="minus('smokingCount', 1)">-</text>
          <input class="num-input" type="number" v-model="form.smokingCount" />
          <text class="num-btn" @click="plus('smokingCount', 1)">+</text>
        </view>
        <text v-else class="form-input" style="text-align: right;">{{ form.smokingCount }}</text>
      </view>

      <!-- 病历图片 -->
      <view class="form-item" style="flex-direction: column; align-items: flex-start;">
        <text class="form-label" style="margin-bottom: 10px;">病历图片</text>
        <view class="img-list">
          <view v-for="(img, idx) in imgList" :key="idx" class="img-wrap">
            <image :src="img.url" class="img-item" mode="aspectFill" @click="previewImage(idx)"></image>
            <text v-if="!isView" class="img-del" @click="removeImg(idx)">x</text>
          </view>
          <view v-if="!isView && imgList.length < 5" class="img-upload" @click="chooseImage">
            <text class="upload-icon">+</text>
          </view>
        </view>
        <text class="upload-tip">只能上传jpg/png文件，单个不超过500KB，最多5张</text>
      </view>

      <view class="form-item" style="flex-direction: column; align-items: flex-start;">
        <text class="form-label" style="margin-bottom: 8px;">诊断结果</text>
        <textarea class="form-textarea" v-model="form.diagnosisResult" placeholder="请输入诊断结果" :disabled="isView" />
      </view>
      <view class="form-item" style="flex-direction: column; align-items: flex-start;">
        <text class="form-label" style="margin-bottom: 8px;">治疗建议</text>
        <textarea class="form-textarea" v-model="form.treatmentSuggestion" placeholder="请输入治疗建议" :disabled="isView" />
      </view>
      <view class="form-item" style="flex-direction: column; align-items: flex-start;">
        <text class="form-label" style="margin-bottom: 8px;">医生备注</text>
        <textarea class="form-textarea" v-model="form.remark" placeholder="请输入医生备注" :disabled="isView" />
      </view>
    </view>

    <view class="footer" v-if="!isView">
      <button class="submit-btn" @click="submitForm">确 定</button>
      <button class="cancel-btn" @click="cancel">取 消</button>
    </view>
    <view class="footer" v-else>
      <button class="cancel-btn" @click="cancel">关 闭</button>
    </view>

    <!-- 医生多选弹窗 -->
    <view class="doctor-popup" v-show="doctorPopupVisible" @click="closeDoctorPopup">
      <view class="popup-mask"></view>
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-cancel" @click="closeDoctorPopup">取消</text>
          <text class="popup-title">选择主治医生</text>
          <text class="popup-confirm" @click="confirmDoctor">确定</text>
        </view>
        <scroll-view scroll-y class="popup-body">
          <view v-for="doctor in doctorList" :key="doctor.value" class="checkbox-item" @click="toggleDoctor(doctor.value)">
            <text class="checkbox-icon" :class="{ checked: tempDoctorIds.includes(doctor.value) }">
              {{ tempDoctorIds.includes(doctor.value) ? '✓' : '' }}
            </text>
            <text class="checkbox-label">{{ doctor.label }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const baseUrl = 'https://yiliao.admin.php7788.com/prod-api';
const uploadUrl = `${baseUrl}/system/file/upload`;

const mode = ref('add');
const isView = computed(() => mode.value === 'view');
const isEdit = computed(() => mode.value === 'edit');

const form = ref({
  patientId: undefined,
  recordId: undefined,
  department: '',
  doctorId: [],
  doctorName: '',
  sugarValue: '',
  systolicPressure: '',
  diastolicPressure: '',
  ldlValue: '',
  height: '',
  weight: '',
  smokingCount: '',
  imgUrl: '',
  diagnosisResult: '',
  treatmentSuggestion: '',
  remark: '',
  sugarScore: 0,
  pressureScore: 0,
  ldlScore: 0,
  bmiScore: 0,
  smokingScore: 0,
  totalScore: 0,
  riskLevel: ''
});

const imgList = ref([]);
const doctorList = ref([]);
const doctorPopupVisible = ref(false);
const tempDoctorIds = ref([]);

const selectedDoctorNames = computed(() => {
  const names = form.value.doctorId.map(id => {
    const doc = doctorList.value.find(d => d.value === id);
    return doc ? doc.label : '';
  }).filter(n => n);
  return names.join(', ');
});

const getScoreClass = (score) => {
  if (score >= 10) return 'score-high';
  if (score >= 5) return 'score-medium';
  return 'score-low';
};

const getRiskClass = (risk) => {
  if (risk === '高危') return 'risk-high';
  if (risk === '中危') return 'risk-medium';
  return 'risk-low';
};

const getDoctorList = () => {
  uni.request({
    url: `${baseUrl}/system/user/querySysUserList`,
    method: 'GET',
    header: { Authorization: uni.getStorageSync('token') || '' },
    success: (res) => {
      if (res.data && res.data.code === 200) {
        doctorList.value = (res.data.rows || []).map(item => ({
          value: item.userId,
          label: item.userName
        }));
      }
    }
  });
};

const plus = (key, step, precision) => {
  let val = parseFloat(form.value[key]) || 0;
  val += step;
  if (precision !== undefined) {
    val = parseFloat(val.toFixed(precision));
  }
  form.value[key] = val;
};

const minus = (key, step, precision) => {
  let val = parseFloat(form.value[key]) || 0;
  val -= step;
  if (val < 0) val = 0;
  if (precision !== undefined) {
    val = parseFloat(val.toFixed(precision));
  }
  form.value[key] = val;
};

const chooseImage = () => {
  const remain = 5 - imgList.value.length;
  if (remain <= 0) return;
  uni.chooseImage({
    count: remain,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      res.tempFilePaths.forEach(path => {
        uni.uploadFile({
          url: uploadUrl,
          filePath: path,
          name: 'file',
          formData: { bizType: 'record' },
          header: { Authorization: uni.getStorageSync('token') || '' },
          success: (uploadRes) => {
            try {
              const data = JSON.parse(uploadRes.data);
              if (data.code === 200) {
                let url = data.data;
                if (url.startsWith(baseUrl)) url = url.replace(baseUrl, '');
                imgList.value.push({ url: baseUrl + url, rawUrl: url });
                updateImgUrl();
              }
            } catch (e) {
              console.error(e);
            }
          }
        });
      });
    }
  });
};

const removeImg = (idx) => {
  imgList.value.splice(idx, 1);
  updateImgUrl();
};

const updateImgUrl = () => {
  form.value.imgUrl = imgList.value.map(item => item.rawUrl || item.url).join(',');
};

const previewImage = (idx) => {
  const urls = imgList.value.map(item => item.url);
  uni.previewImage({
    current: urls[idx],
    urls: urls
  });
};

const showDoctorPicker = () => {
  tempDoctorIds.value = [...(form.value.doctorId || [])];
  doctorPopupVisible.value = true;
};

const closeDoctorPopup = () => {
  doctorPopupVisible.value = false;
};

const toggleDoctor = (id) => {
  const idx = tempDoctorIds.value.indexOf(id);
  if (idx > -1) {
    tempDoctorIds.value.splice(idx, 1);
  } else {
    tempDoctorIds.value.push(id);
  }
};

const confirmDoctor = () => {
  form.value.doctorId = [...tempDoctorIds.value];
  const names = form.value.doctorId.map(id => {
    const doc = doctorList.value.find(d => d.value === id);
    return doc ? doc.label : '';
  }).filter(n => n);
  form.value.doctorName = names.join(', ');
  doctorPopupVisible.value = false;
};

const submitForm = () => {
  const requiredFields = [
    { key: 'sugarValue', label: '糖化血红蛋白' },
    { key: 'systolicPressure', label: '收缩压' },
    { key: 'diastolicPressure', label: '舒张压' },
    { key: 'ldlValue', label: '低密度脂蛋白' },
    { key: 'height', label: '身高' },
    { key: 'weight', label: '体重' },
    { key: 'smokingCount', label: '吸烟支数' }
  ];
  for (const field of requiredFields) {
    if (form.value[field.key] === '' || form.value[field.key] == null) {
      uni.showToast({ title: `${field.label}不能为空`, icon: 'none' });
      return;
    }
  }

  const url = isEdit.value ? '/system/score/record' : '/system/score/record/submit';
  const method = isEdit.value ? 'PUT' : 'POST';

  uni.request({
    url: `${baseUrl}${url}`,
    method: method,
    header: {
      'Content-Type': 'application/json',
      Authorization: uni.getStorageSync('token') || ''
    },
    data: form.value,
    success: (res) => {
      if (res.data && res.data.code === 200) {
        uni.showToast({ title: isEdit.value ? '修改成功' : '新增成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } else {
        uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: isEdit.value ? '修改成功' : '新增成功', icon: 'success' });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  });
};

const cancel = () => {
  uni.navigateBack();
};

onLoad((options) => {
  mode.value = options.mode || 'add';
  getDoctorList();

  if (options.mode === 'add') {
    form.value.patientId = options.patientId;
  } else if (options.data) {
    try {
      const data = JSON.parse(decodeURIComponent(options.data));
      form.value = { ...form.value, ...data };
      // 处理医生ID
      if (typeof form.value.doctorId === 'string' && form.value.doctorId) {
        form.value.doctorId = form.value.doctorId.split(',').map(id => Number(id.trim()));
      } else if (!Array.isArray(form.value.doctorId)) {
        form.value.doctorId = [];
      }
      // 处理图片回显
      imgList.value = [];
      if (form.value.imgUrl) {
        const cleanStr = form.value.imgUrl.trim().replace(/^`|`$/g, '');
        if (cleanStr) {
          imgList.value = cleanStr.split(',').map(url => {
            const u = url.trim();
            if (u.startsWith('http')) {
              return { url: u, rawUrl: u };
            } else {
              return { url: baseUrl + u, rawUrl: u };
            }
          }).filter(item => item.url);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 30px;
}
.score-section {
  background-color: #f5f7fa;
  margin: 15px;
  border-radius: 10px;
  padding: 20px;
}
.score-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}
.score-grid {
  display: flex;
  flex-wrap: wrap;
}
.score-item {
  width: 33.33%;
  text-align: center;
  margin-bottom: 15px;
}
.score-num {
  display: block;
  font-size: 22px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}
.score-num.score-high { color: #F56C6C; }
.score-num.score-medium { color: #E6A23C; }
.score-num.score-low { color: #67C23A; }
.score-label {
  font-size: 12px;
  color: #909399;
}
.risk-tag {
  display: inline-block;
  padding: 6px 15px;
  border-radius: 4px;
  font-size: 13px;
  color: #fff;
  text-align: center;
  margin: 0 auto;
  display: block;
  width: fit-content;
}
.risk-tag.risk-high { background-color: #F56C6C; }
.risk-tag.risk-medium { background-color: #E6A23C; }
.risk-tag.risk-low { background-color: #67C23A; }
.form-section {
  background-color: #fff;
  margin: 15px;
  border-radius: 10px;
  padding: 15px;
}
.form-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.form-item:last-child {
  border-bottom: none;
}
.form-label {
  width: 150px;
  font-size: 14px;
  color: #333;
  line-height: 22px;
  flex-shrink: 0;
}
.required::before {
  content: '* ';
  color: #ff4d4f;
}
.form-input {
  flex: 1;
  font-size: 14px;
  color: #333;
  text-align: right;
  line-height: 22px;
}
.number-box {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
}
.num-btn {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background-color: #f0f0f0;
  color: #666;
  font-size: 16px;
  border-radius: 4px;
}
.num-input {
  width: 70px;
  text-align: center;
  font-size: 14px;
  color: #333;
  margin: 0 8px;
  height: 30px;
  line-height: 30px;
}
.img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.img-wrap {
  position: relative;
  width: 80px;
  height: 80px;
}
.img-item {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  background-color: #f5f5f5;
}
.img-del {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
}
.img-upload {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}
.upload-icon {
  font-size: 24px;
  color: #999;
}
.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
.form-textarea {
  width: 100%;
  font-size: 14px;
  color: #333;
  height: 80px;
  background-color: #fafafa;
  padding: 10px;
  border-radius: 4px;
  box-sizing: border-box;
}
.footer {
  display: flex;
  gap: 15px;
  padding: 20px 15px;
}
.submit-btn {
  flex: 1;
  background-color: #1890ff;
  color: #fff;
  border-radius: 25px;
  font-size: 16px;
  padding: 2px 0;
}
.cancel-btn {
  flex: 1;
  background-color: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
  border-radius: 25px;
  font-size: 16px;
  padding: 2px 0;
}
.doctor-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}
.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}
.popup-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius: 10px 10px 0 0;
  max-height: 60vh;
}
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}
.popup-cancel {
  font-size: 14px;
  color: #999;
}
.popup-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.popup-confirm {
  font-size: 14px;
  color: #1890ff;
}
.popup-body {
  max-height: 50vh;
  padding: 10px 15px;
}
.checkbox-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}
.checkbox-icon {
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
  margin-right: 10px;
  font-size: 12px;
  color: #fff;
}
.checkbox-icon.checked {
  background-color: #1890ff;
  border-color: #1890ff;
}
.checkbox-label {
  font-size: 14px;
  color: #333;
}
</style>
