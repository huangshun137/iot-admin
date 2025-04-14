<script setup lang="ts">
import { reactive, ref } from "vue";
import ReCol from "@/components/ReCol";
import { ProductPropertyInfo } from "@/api/product";
import type { FormRules } from "element-plus";
import { ProductPropertyTypeList, NumberTypeList } from "@/utils/const";

type ProductProperty = {
  formInline: Omit<ProductPropertyInfo, "createdAt">;
};

const formRules = reactive<FormRules>({
  name: [{ required: true, message: "属性名称为必填项", trigger: "blur" }],
  type: [{ required: true, message: "数据类型为必填项", trigger: "blur" }],
  accessMethod: [
    {
      required: true,
      message: "访问权限为必填项",
      trigger: "blur",
      type: "array"
    }
  ],
  "dataRange[0]": [
    { required: true, message: "取值范围为必填项" },
    { min: 0, message: "取值范围为0~65535", type: "number" },
    { max: 65535, message: "取值范围为0~65535", type: "number" }
  ],
  "dataRange[1]": [
    { required: true, message: "取值范围为必填项" },
    { min: 0, message: "取值范围为0~65535", type: "number" },
    { max: 65535, message: "取值范围为0~65535", type: "number" }
  ],
  length: [
    { required: true, message: "长度为必填项" },
    { min: 0, message: "长度为0~65535", type: "number" },
    { max: 65535, message: "长度为0~65535", type: "number" }
  ]
});

const props = withDefaults(defineProps<ProductProperty>(), {
  formInline: () => ({
    _id: null,
    name: "",
    type: "int",
    accessMethod: [],
    requestUrl: "",
    requestMethod: "",
    description: "",
    dataRange: [0, 65535],
    length: null
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
        <el-form-item label="属性名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入属性名称"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="属性描述">
          <el-input
            v-model="newFormInline.description"
            placeholder="请输入属性描述"
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
            <el-option
              v-for="item in ProductPropertyTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="访问权限" prop="accessMethod">
          <el-checkbox-group v-model="newFormInline.accessMethod">
            <el-checkbox label="可读" value="read" border />
            <el-checkbox label="可写" value="write" border />
          </el-checkbox-group>
        </el-form-item>
      </re-col>
      <template v-if="newFormInline.accessMethod.includes('write')">
        <re-col>
          <el-form-item label="请求URL" prop="requestUrl">
            <el-input
              v-model="newFormInline.requestUrl"
              clearable
              placeholder="请输入请求URL"
            />
          </el-form-item>
        </re-col>
        <re-col>
          <el-form-item label="请求方法" prop="requestMethod">
            <!-- <el-select
              v-model="newFormInline.requestMethod"
              placeholder="请选择请求方法"
              class="w-full"
            >
              <el-option
                v-for="item in ProductPropertyTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select> -->
            <el-input
              v-model="newFormInline.requestMethod"
              clearable
              placeholder="请输入请求方法"
            />
          </el-form-item>
        </re-col>
        <re-col>
          <el-form-item label="请求参数" prop="requestParam">
            <el-input
              v-model="newFormInline.requestParam"
              clearable
              placeholder="请输入请求参数，默认为属性名称"
            />
          </el-form-item>
        </re-col>
      </template>
      <re-col v-if="newFormInline.type !== 'boolean'">
        <el-form-item
          v-if="NumberTypeList.includes(newFormInline.type)"
          label="取值范围"
        >
          <el-form-item prop="dataRange[0]">
            <el-input-number
              v-model="newFormInline.dataRange[0]"
              :controls="false"
              class="!w-[80px]"
            />
          </el-form-item>
          <span class="ml-2 mr-2">-</span>
          <el-form-item prop="dataRange[1]">
            <el-input-number
              v-model="newFormInline.dataRange[1]"
              :controls="false"
              class="!w-[80px]"
            />
          </el-form-item>
        </el-form-item>
        <el-form-item v-else label="长度" prop="length">
          <el-input-number
            v-model="newFormInline.length"
            :controls="false"
            class="!w-full"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
