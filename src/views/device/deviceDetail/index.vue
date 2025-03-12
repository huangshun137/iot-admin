<script lang="ts" setup>
import { computed, ref } from "vue";
import dayjs from "dayjs";
import { useDeviceDetail, useMqttPropertyInfo, usePropertyInfo } from "./hook";

defineOptions({
  name: "DeviceDetail"
});

const productId = computed(() => deviceDetail.value.product?._id);

const { loading: detailLoading, deviceDetail } = useDeviceDetail();
const { loading: propertyLoading, propertyList } = usePropertyInfo(productId);
const { propertyInfo } = useMqttPropertyInfo(deviceDetail);
</script>
<template>
  <div class="main">
    <el-card v-loading="detailLoading">
      <template #header>
        <h3>设备详情</h3>
      </template>
      <el-descriptions>
        <el-descriptions-item label="设备名称">{{
          deviceDetail.name
        }}</el-descriptions-item>
        <el-descriptions-item label="设备ID">{{
          deviceDetail.deviceId
        }}</el-descriptions-item>
        <el-descriptions-item label="所属产品">{{
          deviceDetail.product?.name
        }}</el-descriptions-item>
        <el-descriptions-item label="设备标识码">{{
          deviceDetail.code
        }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{
          deviceDetail.createdAt
            ? dayjs(deviceDetail.createdAt).format("YYYY-MM-DD HH:mm:ss")
            : ""
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-loading="propertyLoading" class="mt-3">
      <template #header>
        <h3>物模型数据</h3>
      </template>
      <div class="property-card">
        <el-card
          v-for="(item, index) in propertyList"
          :key="index"
          class="mt-3 mr-3 w-1/4"
        >
          <h4>{{ item.name }}</h4>
          <span>{{ item.description }}</span>
          <span>{{ propertyInfo?.[item.name] }}</span>
        </el-card>
      </div>
    </el-card>
  </div>
</template>
<style scoped lang="scss">
.property-card {
  display: flex;
}
</style>
