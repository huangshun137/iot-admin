<script setup lang="ts">
import { reactive, ref } from "vue";
import { FormRules } from "element-plus";
import ReCol from "@/components/ReCol";
import { DeviceInfo } from "@/api/device";
import { ProductInfo } from "@/api/product";

interface FormProps {
  formInline: Omit<DeviceInfo, "createdAt" | "product">;
  productList: ProductInfo[];
}

const formRules = reactive<FormRules>({
  productId: [{ required: true, message: "所属产品为必填项", trigger: "blur" }],
  code: [
    { required: true, message: "设备标识码为必填项" },
    { min: 5, message: "设备标识码长度不能小于4个字符" }
  ],
  deviceId: [
    { required: true, message: "设备ID为必填项" },
    { min: 5, message: "设备ID长度不能小于4个字符" }
  ]
});

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    _id: null,
    name: "",
    code: "",
    deviceId: "",
    productId: "",
    description: ""
  }),
  productList: () => [] as ProductInfo[]
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function handleDeviceIdUpdate() {
  const { productId, code } = newFormInline.value;
  newFormInline.value.deviceId = (productId || "") + "_" + (code || "");
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
    label-width="120px"
  >
    <el-row :gutter="40">
      <re-col>
        <el-form-item label="所属产品" prop="productId">
          <el-select
            v-model="newFormInline.productId"
            placeholder="请选择所属产品"
            class="w-full"
            :disabled="!!newFormInline._id"
            @change="handleDeviceIdUpdate"
          >
            <el-option
              v-for="item in props.productList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item prop="code">
          <template #label>
            <span>设备标识码</span>
            <el-tooltip
              class="box-item"
              content="通常使用IMEI、MAC地址或Serial No作为设备标识码"
              placement="right"
            >
              <IconifyIconOnline icon="ri-question-line" />
            </el-tooltip>
          </template>
          <el-input
            v-model="newFormInline.code"
            clearable
            placeholder="请输入设备标识码"
            :disabled="!!newFormInline._id"
            @change="handleDeviceIdUpdate"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="设备ID" prop="deviceId">
          <el-input
            v-model="newFormInline.deviceId"
            clearable
            placeholder="请输入设备ID"
            :disabled="!!newFormInline._id"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="设备名称">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入设备名称"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="设备描述">
          <el-input
            v-model="newFormInline.description"
            placeholder="请输入设备描述"
            type="textarea"
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
