<template>
  <view class="container">
    <!-- 指标说明表 -->
    <view class="indicator-table">
      <view class="table-header">
        <text class="table-title">项目得分</text>
        <text class="score-label">0分</text>
        <text class="score-label">1分</text>
        <text class="score-label">2分</text>
      </view>
      <view class="table-row">
        <text class="row-name">A (糖化)</text>
        <text class="row-value">6.5%</text>
        <text class="row-value">6.5~8%</text>
        <text class="row-value">8%</text>
      </view>
      <view class="table-row">
        <text class="row-name">B (血压)</text>
        <text class="row-value">正常</text>
        <text class="row-value">1级高血压</text>
        <text class="row-value">2级高血压</text>
      </view>
      <view class="table-row">
        <text class="row-name">C (血脂) LDL</text>
        <text class="row-value">2.6</text>
        <text class="row-value">2.6~3.4</text>
        <text class="row-value">3.4</text>
      </view>
      <view class="table-row">
        <text class="row-name">O (体重) BMI</text>
        <text class="row-value">24</text>
        <text class="row-value">24~28</text>
        <text class="row-value">28</text>
      </view>
      <view class="table-row">
        <text class="row-name">S (控烟)</text>
        <text class="row-value">不吸烟</text>
        <text class="row-value">1~10支</text>
        <text class="row-value">10支</text>
      </view>
    </view>

    <view class="form-list">
      <!-- 糖化 -->
      <view class="form-item">
        <view class="item-left">
          <image src="../../static/icon/tanghua.png" class="item-icon"></image>
          <text class="item-title">糖化</text>
        </view>
        <view class="item-right">
          <picker @change="onSugarChange" :value="sugarIndex" :range="sugarOptions" range-key="label">
            <view class="picker-view">
              <text :class="['picker-text', !sugarLabel ? 'placeholder' : '']">{{ sugarLabel || '请选择糖化指标' }}</text>
              <uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
            </view>
          </picker>
        </view>
      </view>
      <!-- 血压 -->
      <view class="form-item">
        <view class="item-left">
          <image src="../../static/icon/xieya.png" class="item-icon"></image>
          <text class="item-title">血压</text>
        </view>
        <view class="item-right">
          <picker @change="onPressureChange" :value="pressureIndex" :range="pressureOptions" range-key="label">
            <view class="picker-view">
              <text :class="['picker-text', !pressureLabel ? 'placeholder' : '']">{{ pressureLabel || '请选择血压指标'
                }}</text>
              <uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
            </view>
          </picker>
        </view>
      </view>

      <!-- 血脂 -->
      <view class="form-item">
        <view class="item-left">
          <image src="../../static/icon/xiezhi1.png" class="item-icon"></image>
          <text class="item-title">血脂 (LDL)</text>
        </view>
        <view class="item-right">
          <picker @change="onLdlChange" :value="ldlIndex" :range="ldlOptions" range-key="label">
            <view class="picker-view">
              <text :class="['picker-text', !ldlLabel ? 'placeholder' : '']">{{ ldlLabel || '请选择血脂指标' }}</text>
              <uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
            </view>
          </picker>
        </view>
      </view>

      <!-- 体重 -->
      <view class="form-item">
        <view class="item-left">
          <image src="../../static/icon/tizhong.png" class="item-icon"></image>
          <text class="item-title">体重 (BMI)</text>
        </view>
        <view class="item-right">
          <picker @change="onBmiChange" :value="bmiIndex" :range="bmiOptions" range-key="label">
            <view class="picker-view">
              <text :class="['picker-text', !bmiLabel ? 'placeholder' : '']">{{ bmiLabel || '请选择BMI指标' }}</text>
              <uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
            </view>
          </picker>
        </view>
      </view>

      <!-- 控烟 -->
      <view class="form-item">
        <view class="item-left">
          <image src="../../static/icon/kongyan.png" class="item-icon"></image>
          <text class="item-title">控烟</text>
        </view>
        <view class="item-right">
          <picker @change="onSmokingChange" :value="smokingIndex" :range="smokingOptions" range-key="label">
            <view class="picker-view">
              <text :class="['picker-text', !smokingLabel ? 'placeholder' : '']">{{ smokingLabel || '请选择控烟指标' }}</text>
              <uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="btn-container">
      <u--button type="primary" size="large" @click="saveData">保存数据</u--button>
    </view>
  </view>
</template>

<script setup >
import { ref } from 'vue';

const form = ref({
  sugarValue: '',
  systolicPressure: '',
  diastolicPressure: '',
  ldlValue: '',
  height: '',
  weight: '',
  smokingCount: ''
});

// 下拉选择索引
const sugarIndex = ref(0);
const pressureIndex = ref(0);
const ldlIndex = ref(0);
const bmiIndex = ref(0);
const smokingIndex = ref(0);

// 下拉选择显示的文本
const sugarLabel = ref('');
const pressureLabel = ref('');
const ldlLabel = ref('');
const bmiLabel = ref('');
const smokingLabel = ref('');

// 糖化选项（0分、1分、2分）
const sugarOptions = ref([
  { label: '<6.5% (0分)', value: 0, score: 0 },
  { label: '6.5~8% (1分)', value: 1, score: 1 },
  { label: '>8% (2分)', value: 2, score: 2 }
]);

// 血压选项
const pressureOptions = ref([
  { label: '正常 (0分)', value: 0, score: 0 },
  { label: '1级高血压 (1分)', value: 1, score: 1 },
  { label: '2级高血压 (2分)', value: 2, score: 2 }
]);

// 血脂选项
const ldlOptions = ref([
  { label: '<2.6 (0分)', value: 0, score: 0 },
  { label: '2.6~3.4 (1分)', value: 1, score: 1 },
  { label: '>3.4 (2分)', value: 2, score: 2 }
]);

// BMI选项
const bmiOptions = ref([
  { label: '<24 (0分)', value: 0, score: 0 },
  { label: '24~28 (1分)', value: 1, score: 1 },
  { label: '>28 (2分)', value: 2, score: 2 }
]);

// 控烟选项
const smokingOptions = ref([
  { label: '不吸烟 (0分)', value: 0, score: 0 },
  { label: '1~10支 (1分)', value: 1, score: 1 },
  { label: '>10支 (2分)', value: 2, score: 2 }
]);

// 选择变化处理函数
const onSugarChange = (e) => {
  const index = parseInt(e.detail.value);
  sugarIndex.value = index;
  const selected = sugarOptions.value[index];
  sugarLabel.value = selected.label;
  form.value.sugarValue = selected.score;
};

const onPressureChange = (e) => {
  const index = parseInt(e.detail.value);
  pressureIndex.value = index;
  const selected = pressureOptions.value[index];
  pressureLabel.value = selected.label;
  form.value.systolicPressure = selected.score;
  form.value.diastolicPressure = selected.score;
};

const onLdlChange = (e) => {
  const index = parseInt(e.detail.value);
  ldlIndex.value = index;
  const selected = ldlOptions.value[index];
  ldlLabel.value = selected.label;
  form.value.ldlValue = selected.score;
};

const onBmiChange = (e) => {
  const index = parseInt(e.detail.value);
  bmiIndex.value = index;
  const selected = bmiOptions.value[index];
  bmiLabel.value = selected.label;
  form.value.height = selected.score;
  form.value.weight = selected.score;
};

const onSmokingChange = (e) => {
  const index = parseInt(e.detail.value);
  smokingIndex.value = index;
  const selected = smokingOptions.value[index];
  smokingLabel.value = selected.label;
  form.value.smokingCount = selected.score;
};

const saveData = () => {
  // 表单验证
  if (!sugarLabel.value || !pressureLabel.value || !ldlLabel.value || !bmiLabel.value || !smokingLabel.value) {
    uni.showToast({
      title: '请选择完整数据',
      icon: 'none'
    });
    return;
  }
  // form.value.doctorId = uni.getStorageSync('userInfo').doctorId;
  form.value.patientId = uni.getStorageSync('userInfo').patientId;
  console.log(form.value, '评分form.value=====')
  // return false;
  // 调用保存接口
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/score/record/submit',
    method: 'POST',
    header: {
      'Authorization': 'Bearer ' + uni.getStorageSync('token'),
      'Content-Type': 'application/json'
    },
    data: form.value,
    success: (res) => {
      if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        // 保存成功后跳转到历史记录页面
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/record/record'
          });
        }, 1500);
      } else {
        uni.showToast({
          title: res.data.msg || '保存失败',
          icon: 'none'
        });
      }
    },
    fail: () => {
      uni.showToast({
        title: '网络错误',
        icon: 'none'
      });
    }
  });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f0f0f0;
  padding: 20px;
  box-sizing: border-box;
}

.form-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 10px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  min-width: 100px;
}

.item-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}

.item-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  /* margin-left: 10px; */
  overflow: hidden;
}

.item-right.multi-input {
  gap: 8px;
}

.item-input {
  font-size: 13px;
  color: #666;
  text-align: right;
  width: 180px;
}

.item-input.small {
  width: 90px;
}

.btn-container {
  margin-top: 40px;
  padding: 0 10px;
  border-radius: 12px;
}

/* 指标说明表 */
.indicator-table {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 12px 8px;
  margin-bottom: 8px;
}

.table-title {
  flex: 2;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  text-align: center;
}

.score-label {
  flex: 1;
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  text-align: center;
}

.table-row {
  display: flex;
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
}

.table-row:last-child {
  border-bottom: none;
}

.row-name {
  flex: 2;
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.row-value {
  flex: 1;
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* picker 样式 */
.picker-view {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  min-width: 160px;
  justify-content: space-between;
}

.picker-text {
  font-size: 14px;
  color: #333;
}

.picker-text.placeholder {
  color: #999;
}
</style>
