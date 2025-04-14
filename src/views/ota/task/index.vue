<script setup lang="ts">
import { ref } from "vue";
import dayjs from "dayjs";

import { useOTATask, useTaskDetail } from "./hook";
import ReCol from "@/components/ReCol";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { OtaTaskStatusList } from "@/utils/const";

import Delete from "@iconify-icons/ep/delete";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import View from "@iconify-icons/ep/view";
import StopFill from "@iconify-icons/ri/stop-fill";

defineOptions({
  name: "OTAPackage"
});

const formRef = ref();
const tableRef = ref();
const detailTableRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  drawer,
  taskDetail,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleDetail
} = useOTATask();

const {
  columns: detailCol,
  dataList: detailDataList,
  loading: detailLoading,
  getDeviceListInfo,
  handleRetry,
  handleStop,
  handleDelete: handleDeleteDetail
} = useTaskDetail(taskDetail);

function onFullscreen() {
  // 重置表格高度
  tableRef.value.setAdaptive();
}
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="任务名称：" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入任务名称"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="任务状态：" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择任务状态"
          clearable
          class="!w-[180px]"
        >
          <el-option
            v-for="item in OtaTaskStatusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      title="任务列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
      @fullscreen="onFullscreen"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新建任务
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          border
          adaptive
          :adaptiveConfig="{ offsetBottom: 45 }"
          row-key="_id"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :data="dataList"
          :size="size"
          :columns="dynamicColumns"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(View)"
              @click="handleDetail(row)"
            >
              详情
            </el-button>
            <el-popconfirm
              v-if="row.status !== 'running' && row.status !== 'pending'"
              title="是否确认删除"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
            <el-button
              v-else
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(StopFill)"
              >停止</el-button
            >
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <el-drawer v-model="drawer" title="任务详情" size="800">
      <el-form ref="ruleFormRef" label-width="120px">
        <el-row :gutter="40">
          <re-col :value="12">
            <el-form-item label="任务名称">
              {{ taskDetail.name }}
            </el-form-item>
          </re-col>
          <re-col :value="12">
            <el-form-item label="状态">
              {{
                OtaTaskStatusList.find(item => item.value === taskDetail.status)
                  ?.label ?? "--"
              }}
            </el-form-item>
          </re-col>
          <re-col :value="12">
            <el-form-item label="开始时间">
              {{ dayjs(taskDetail.createdAt).format("YYYY-MM-DD HH:mm:ss") }}
            </el-form-item>
          </re-col>
          <re-col :value="12">
            <el-form-item label="目标资源包">
              {{ taskDetail.package.name }}({{ taskDetail.package.version }})
            </el-form-item>
          </re-col>
          <re-col>
            <PureTableBar
              title="执行详情"
              :columns="detailCol"
              :tableRef="detailTableRef?.getTableRef()"
              @refresh="getDeviceListInfo"
            >
              <template v-slot="{ size, dynamicColumns }">
                <pure-table
                  ref="detailTableRef"
                  border
                  adaptive
                  row-key="_id"
                  showOverflowTooltip
                  table-layout="auto"
                  :loading="detailLoading"
                  :data="detailDataList"
                  :size="size"
                  :columns="dynamicColumns"
                  max-height="250"
                  :header-cell-style="{
                    background: 'var(--el-fill-color-light)',
                    color: 'var(--el-text-color-primary)'
                  }"
                >
                  <template #operation="{ row }">
                    <el-button
                      class="reset-margin"
                      link
                      type="primary"
                      :size="size"
                      :icon="useRenderIcon(Refresh)"
                      :disabled="
                        row.status === 'running' || row.status === 'pending'
                      "
                      @click="handleRetry(row)"
                    >
                      重试
                    </el-button>
                    <el-popconfirm
                      v-if="
                        row.status !== 'running' && row.status !== 'pending'
                      "
                      title="是否确认删除"
                      @confirm="handleDeleteDetail(row)"
                    >
                      <template #reference>
                        <el-button
                          class="reset-margin"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon(Delete)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-popconfirm>
                    <el-button
                      v-else
                      class="reset-margin"
                      link
                      type="primary"
                      :size="size"
                      :icon="useRenderIcon(StopFill)"
                      @click="handleStop(row)"
                      >停止</el-button
                    >
                  </template>
                </pure-table>
              </template>
            </PureTableBar>
          </re-col>
        </el-row>
      </el-form>
    </el-drawer>
  </div>
</template>
