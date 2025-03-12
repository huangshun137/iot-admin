<script setup lang="ts">
import { reactive, ref } from "vue";
import ReCol from "@/components/ReCol";
import { ProductParamInfo } from "@/api/product";
import type { FormRules } from "element-plus";

type CommandParam = {
  formInline: Omit<ProductParamInfo, "createdAt">;
};

const formRules = reactive<FormRules>({
  name: [{ required: true, message: "参数名称为必填项", trigger: "blur" }],
  type: [{ required: true, message: "数据类型为必填项", trigger: "blur" }],
  "dataRange[0]": [
    { required: true, message: "取值范围为必填项", trigger: "blur" }
  ],
  "dataRange[1]": [
    { required: true, message: "取值范围为必填项", trigger: "blur" }
  ]
});

const props = withDefaults(defineProps<CommandParam>(), {
  formInline: () => ({
    _id: null,
    name: "",
    type: "int",
    description: "",
    dataRange: [0, 65535]
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
        <el-form-item label="参数名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入参数名称"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="参数描述">
          <el-input
            v-model="newFormInline.description"
            placeholder="请输入参数描述"
            type="textarea"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="数据类型" prop="type">
          <el-select
            v-model="newFormInline.type"
            placeholder="请选择数据类型"
            class="w-full"
          >
            <el-option label="int(整型)" value="int" />
            <el-option label="long(长整型)" value="long" />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="取值范围">
          <el-form-item prop="dataRange[0]">
            <el-input-number
              v-model="newFormInline.dataRange[0]"
              :controls="false"
              class="!w-[120px]"
            />
          </el-form-item>
          <span class="ml-1 mr-1">-</span>
          <el-form-item prop="dataRange[1]">
            <el-input-number
              v-model="newFormInline.dataRange[1]"
              :controls="false"
              class="!w-[120px]"
            />
          </el-form-item>
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
