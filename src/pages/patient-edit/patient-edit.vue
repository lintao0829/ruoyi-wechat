<template>
  <view class="container">
    <view class="form">
      <view class="form-item">
        <text class="label">姓名</text>
        <input class="input" v-model="form.name" placeholder="请输入患者姓名" />
      </view>
      <view class="form-item">
        <text class="label">电话</text>
        <input class="input" v-model="form.phone" type="number" placeholder="请输入电话号码" />
      </view>
      <view class="form-item">
        <text class="label">性别</text>
        <picker :range="sexOptions" @change="onSexChange">
          <view class="picker">{{ sexOptions[form.sex] || '请选择性别' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">年龄</text>
        <input class="input" v-model="form.age" type="number" placeholder="请输入年龄" />
      </view>
      <view class="form-item">
        <text class="label">诊断结果</text>
        <input class="input" v-model="form.diagnosisResult" placeholder="请输入诊断结果" />
      </view>
      <view class="form-item">
        <text class="label">治疗建议</text>
        <textarea class="textarea" v-model="form.treatmentSuggestion" placeholder="请输入治疗建议" />
      </view>
      <view class="btn-group">
        <button class="btn cancel" @click="goBack">取消</button>
        <button class="btn submit" @click="submit">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
  id: '',
  name: '',
  phone: '',
  sex: 0,
  age: '',
  diagnosisResult: '',
  treatmentSuggestion: ''
});

const sexOptions = ['男', '女'];

const onSexChange = (e) => {
  form.value.sex = e.detail.value;
};

const goBack = () => {
  uni.navigateBack();
};

const submit = () => {
  if (!form.value.name) {
    uni.showToast({ title: '请输入姓名', icon: 'none' });
    return;
  }
  uni.showToast({ title: '保存成功', icon: 'success' });
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}
.form {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
}
.form-item {
  margin-bottom: 20px;
}
.label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}
.input, .textarea, .picker {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
}
.textarea {
  height: 100px;
}
.btn-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}
.btn {
  flex: 1;
  padding: 12px;
  border-radius: 25px;
  font-size: 16px;
}
.cancel {
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
}
.submit {
  background-color: #1890ff;
  color: #fff;
  border: none;
}
</style>
