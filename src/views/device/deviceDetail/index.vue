<script lang="ts" setup>
import { computed } from "vue";
import dayjs from "dayjs";
import { ReText } from "@/components/ReText";
import { useDeviceDetail, useMqttPropertyInfo, usePropertyInfo } from "./hook";

defineOptions({
  name: "DeviceDetail"
});

const productId = computed(() => deviceDetail.value.product?._id);

const { loading: detailLoading, deviceDetail } = useDeviceDetail();
const { loading: propertyLoading, propertyList } = usePropertyInfo(productId);
const { propertyInfo, openDialog } = useMqttPropertyInfo(
  deviceDetail,
  propertyList,
  productId
);
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

    <el-card v-loading="propertyLoading" class="mt-3 property-content-card">
      <template #header>
        <div class="flex justify-between">
          <h3>物模型数据</h3>
          <div>
            <el-button
              type="primary"
              :disabled="
                propertyList.filter(item => item.accessMethod.includes('write'))
                  .length === 0
              "
              @click="openDialog('property')"
              >属性设置</el-button
            >
            <el-button type="primary" @click="openDialog('command')"
              >命令下发</el-button
            >
          </div>
        </div>
      </template>
      <div class="property-card">
        <el-card
          v-for="(item, index) in propertyList.filter(item =>
            item.accessMethod.includes('read')
          )"
          :key="index"
          class="mt-3 mr-3"
        >
          <h4>{{ item.name }}</h4>
          <ReText class="description-content" :lineClamp="2">
            {{ item.description }}
          </ReText>
          <el-button
            v-if="item.accessMethod.includes('write')"
            class="property-content"
            link
            type="primary"
            @click="openDialog('property', item)"
          >
            <span v-if="!propertyInfo?.[item.name]">--</span>
            <template v-else-if="item.type === 'jsonObject'">
              <p
                v-for="(key, value) in JSON.parse(propertyInfo[item.name])"
                :key="key + value"
              >
                <span>{{ key }}: </span>
                <span>{{ value }}</span>
              </p>
            </template>
            <span v-else>{{ propertyInfo[item.name] }}</span>
          </el-button>
          <div v-else class="property-content">
            <span v-if="!propertyInfo?.[item.name]">--</span>
            <template v-else-if="item.type === 'jsonObject'">
              <p
                v-for="(value, key) in propertyInfo[item.name]"
                :key="key + value"
              >
                <span>{{ key }}: </span>
                <span>{{ value }}</span>
              </p>
            </template>
            <span v-else>{{ propertyInfo[item.name] }}</span>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>
<style scoped lang="scss">
.property-content-card > :deep(.el-card__body) {
  padding-right: calc(var(--el-card-padding) - 0.75rem);
}

.property-card {
  display: flex;
  flex-wrap: wrap;

  & > .el-card {
    width: calc(25% - 0.75rem);
  }

  .description-content {
    color: #808080;
  }

  .property-content {
    display: block;
    margin: 8px 0;
    font-weight: bold;
  }
}
</style>
