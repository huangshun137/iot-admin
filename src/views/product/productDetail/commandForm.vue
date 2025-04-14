<script setup lang="ts">
import { reactive, ref } from "vue";
import ReCol from "@/components/ReCol";
import { ProductCommandInfo } from "@/api/product";
import type { FormRules } from "element-plus";
import { useParamTable } from "./hook";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";

type ProductCommand = {
  formInline: Omit<ProductCommandInfo, "createdAt">;
};

const formRules = reactive<FormRules>({
  name: [{ required: true, message: "命令名称为必填项", trigger: "blur" }]
});

const props = withDefaults(defineProps<ProductCommand>(), {
  formInline: () => ({
    _id: null,
    name: "",
    reqParams: [],
    resParams: []
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

const {
  dataList: reqParams,
  handleDelete: handleReqDelete,
  openDialog: openReqDialog
} = useParamTable(newFormInline.value._id, "reqParams");
const {
  dataList: resParams,
  handleDelete: handleResDelete,
  openDialog: openResDialog
} = useParamTable(newFormInline.value._id, "resParams");

function getRef() {
  return ruleFormRef.value;
}
function getParamsList() {
  return { reqParams: reqParams.value, resParams: resParams.value };
}

defineExpose({ getRef, getParamsList });
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
        <el-form-item label="命令名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入命令名称"
          />
        </el-form-item>
      </re-col>
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
          <el-input
            v-model="newFormInline.requestMethod"
            clearable
            placeholder="请输入请求方法"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="下发参数">
          <el-row>
            <el-button
              type="primary"
              class="mb-1"
              plain
              round
              @click="openReqDialog()"
              >新增下发参数</el-button
            >
          </el-row>
          <el-table
            :data="reqParams"
            style="width: 100%"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
          >
            <el-table-column prop="name" label="参数名称" minWidth="150" />
            <el-table-column prop="type" label="数据类型" minWidth="150" />
            <el-table-column prop="description" label="描述" minWidth="150" />
            <el-table-column prop="name" label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :icon="useRenderIcon(EditPen)"
                  @click="openReqDialog('修改', row)"
                >
                  修改
                </el-button>
                <el-popconfirm
                  title="是否确认删除"
                  @confirm="handleReqDelete(row)"
                >
                  <template #reference>
                    <el-button
                      class="reset-margin"
                      link
                      type="primary"
                      :icon="useRenderIcon(Delete)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="响应参数">
          <el-row>
            <el-button
              type="primary"
              class="mb-1"
              plain
              round
              @click="openResDialog()"
              >新增响应参数</el-button
            >
          </el-row>
          <el-table
            :data="resParams"
            style="width: 100%"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
          >
            <el-table-column prop="name" label="参数名称" minWidth="150" />
            <el-table-column prop="type" label="数据类型" minWidth="150" />
            <el-table-column prop="description" label="描述" minWidth="150" />
            <el-table-column prop="name" label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :icon="useRenderIcon(EditPen)"
                  @click="openResDialog('修改', row)"
                >
                  修改
                </el-button>
                <el-popconfirm
                  title="是否确认删除"
                  @confirm="handleResDelete(row)"
                >
                  <template #reference>
                    <el-button
                      class="reset-margin"
                      link
                      type="primary"
                      :icon="useRenderIcon(Delete)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
