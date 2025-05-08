<script setup lang="ts">
import { OTATaskInfo, PackageInfo } from "@/api/ota";
import ReCol from "@/components/ReCol";
import { PureTableBar } from "@/components/RePureTableBar";
import { FormRules } from "element-plus";
import { reactive, ref } from "vue";
import { useTaskDevice } from "./hook";

interface FormInline
  extends Omit<OTATaskInfo, "createdAt" | "package" | "deviceList" | "status"> {
  packageId: string;
}
interface FormProps {
  formInline: FormInline;
  packageList: PackageInfo[];
}

const formRules = reactive<FormRules>({
  name: [{ required: true, message: "任务名称为必填项" }],
  packageId: [{ required: true, message: "资源包为必选项" }]
});

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    _id: null,
    name: "",
    packageId: ""
  }),
  packageList: () => [] as PackageInfo[]
});

const ruleFormRef = ref();
const tableRef = ref();
const newFormInline = ref(props.formInline);

const { columns, dataList, loading, handlePackageChange, getDeviceListInfo } =
  useTaskDevice(props.packageList, tableRef);

function getRef() {
  return ruleFormRef.value;
}
function getSelectedTableData() {
  return tableRef.value.getTableRef().getSelectionRows();
}

defineExpose({ getRef, getSelectedTableData });
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
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="newFormInline.name" placeholder="请输入任务名称" />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="升级资源包" prop="packageId">
          <el-select
            v-model="newFormInline.packageId"
            placeholder="请选择资源包"
            class="w-full"
            @change="handlePackageChange"
          >
            <el-option
              v-for="item in props.packageList"
              :key="item._id"
              :label="`${item.name}(${item.version})(${item.product.name})`"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col>
        <PureTableBar
          title="设备列表"
          :columns="columns"
          :tableRef="tableRef?.getTableRef()"
          @refresh="getDeviceListInfo"
        >
          <template v-slot="{ size, dynamicColumns }">
            <pure-table
              ref="tableRef"
              border
              adaptive
              row-key="_id"
              showOverflowTooltip
              table-layout="auto"
              :loading="loading"
              :data="dataList"
              :size="size"
              :columns="dynamicColumns"
              max-height="250"
              :header-cell-style="{
                background: 'var(--el-fill-color-light)',
                color: 'var(--el-text-color-primary)'
              }"
            />
          </template>
        </PureTableBar>
      </re-col>
    </el-row>
  </el-form>
</template>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
  align-items: center;
}
</style>
