<template>
  <view class="modal-mask" v-if="visible" @click="closeOnMask && close()">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
        <view class="close-btn" @click="close">
          <uni-icons type="closeempty" size="20" color="#999"></uni-icons>
        </view>
      </view>
      <scroll-view class="modal-body" scroll-y :scroll-with-animation="true">
        <view class="content-wrapper">
          <rich-text :nodes="content"></rich-text>
        </view>
      </scroll-view>
      <view class="modal-footer">
        <button class="confirm-btn" @click="close">我知道了</button>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  closeOnMask: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 16px;
  width: 85%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.close-btn {
  padding: 5px;
}

.modal-body {
  flex: 1;
  max-height: 50vh;
  overflow-y: auto;
}

.content-wrapper {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px 20px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.confirm-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-radius: 22px;
  border: none;
}

.confirm-btn::after {
  border: none;
}

.confirm-btn:active {
  opacity: 0.9;
}
</style>
