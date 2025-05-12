<script setup lang="ts">
import { AgentDeviceInfo, DeviceInfo } from "@/api/device";
import ReCol from "@/components/ReCol";
import { FormRules } from "element-plus";
import { reactive, ref } from "vue";

interface FormProps {
  formInline: AgentDeviceInfo;
  deviceList: DeviceInfo[];
}

const formRules = reactive<FormRules>({
  deviceId: [{ required: true, message: "设备为必选项" }],
  directory: [{ required: true, message: "设备运行目录为必填项" }],
  entryName: [{ required: true, message: "设备运行入口文件为必填项" }]
});

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    _id: null,
    isCustomDevice: false,
    deviceName: "",
    device: null,
    deviceId: null,
    agentId: null,
    directory: "",
    entryName: "",
    condaEnv: null,
    startCommand: null
  }),
  deviceList: () => [] as DeviceInfo[]
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function handleCustomDeviceChange() {
  if (!newFormInline.value.isCustomDevice) {
    newFormInline.value.deviceName = "";
  } else {
    newFormInline.value.deviceId = null;
  }
}
function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="140px"
  >
    <el-row :gutter="40">
      <re-col>
        <el-form-item label="自定义设备" prop="isCustomDevice">
          <el-switch
            v-model="newFormInline.isCustomDevice"
            :disabled="!!props.formInline._id"
            @change="handleCustomDeviceChange"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.isCustomDevice">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input
            v-model="newFormInline.deviceName"
            :disabled="!!props.formInline._id"
            placeholder="请输入设备名称"
          />
        </el-form-item>
      </re-col>
      <re-col v-else>
        <el-form-item label="设备" prop="deviceId">
          <el-select
            v-model="newFormInline.deviceId"
            placeholder="请选择设备"
            filterable
            :disabled="!!props.formInline._id"
            class="w-full"
          >
            <el-option
              v-for="item in props.deviceList"
              :key="item._id"
              :label="item.name || item.code"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="设备运行目录" prop="directory">
          <el-input
            v-model="newFormInline.directory"
            placeholder="请输入设备运行目录"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="设备运行入口文件" prop="entryName">
          <el-input
            v-model="newFormInline.entryName"
            placeholder="请输入设备运行入口文件"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="设备运行环境" prop="condaEnv">
          <el-input
            v-model="newFormInline.condaEnv"
            placeholder="请输入设备运行环境"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="设备启动命令" prop="startCommand">
          <el-input
            v-model="newFormInline.startCommand"
            placeholder="请输入设备启动命令"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
  align-items: center;
}
</style>
