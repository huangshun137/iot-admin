<script setup lang="ts">
import { computed, ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const switchStyle = computed(() => {
  return {
    "--el-switch-on-color": "#6abe39",
    "--el-switch-off-color": "#e84749"
  };
});

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    _id: null,
    protocal: "MQTT",
    name: "",
    type: "",
    status: 1,
    remark: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

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
    label-width="82px"
  >
    <el-row :gutter="40">
      <re-col>
        <el-form-item label="产品名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入产品名称"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="协议类型">
          <el-select
            v-model="newFormInline.protocal"
            placeholder="请选择协议类型"
            class="w-full"
            :disabled="!!newFormInline._id"
          >
            <el-option label="MQTT" value="MQTT" />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="设备类型" prop="type">
          <el-input
            v-model="newFormInline.type"
            clearable
            placeholder="请输入设备类型"
            :disabled="!!newFormInline._id"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="产品状态">
          <el-switch
            v-model="newFormInline.status"
            inline-prompt
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
            :style="switchStyle"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="备注">
          <el-input
            v-model="newFormInline.remark"
            placeholder="请输入备注信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
