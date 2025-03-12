<script lang="ts" setup>
import { ref } from "vue";
import dayjs from "dayjs";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  useCommandTable,
  useProductDetail,
  usePropertyTable,
  useTopicList
} from "./hook";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import AddFill from "@iconify-icons/ri/add-circle-line";

defineOptions({
  name: "ProductDetail"
});

const propertyTableRef = ref();
const commandTableRef = ref();

const { loading: detailLoading, productDetail } = useProductDetail();
const {
  columns: propColumns,
  dataList: propDataList,
  loading: propertyLoading,
  handleDelete: handlePropDelete,
  openDialog: openPropDialog
} = usePropertyTable();
const {
  columns: comColumns,
  dataList: comDataList,
  loading: comLoading,
  handleDelete: handleComDelete,
  openDialog: openComDialog
} = useCommandTable();
const { preTopicList, preTopicColumns, objectSpanMethod } = useTopicList();
</script>
<template>
  <div class="main">
    <el-card v-loading="detailLoading">
      <template #header>
        <h3>产品详情</h3>
      </template>
      <el-descriptions>
        <el-descriptions-item label="产品名称">{{
          productDetail.name
        }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{
          productDetail.type
        }}</el-descriptions-item>
        <el-descriptions-item label="协议类型">{{
          productDetail.protocal
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          productDetail.createdAt
            ? dayjs(productDetail.createdAt).format("YYYY-MM-DD HH:mm:ss")
            : ""
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card
      v-loading="detailLoading"
      class="mt-3"
      :body-style="{ padding: '8px', paddingTop: 0 }"
    >
      <template #header>
        <h3>模型定义</h3>
      </template>
      <!-- 属性列表 -->
      <PureTableBar
        title="属性列表"
        :columns="propColumns"
        :tableRef="propertyTableRef?.getTableRef()"
      >
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openPropDialog()"
          >
            新增属性
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="propertyTableRef"
            border
            max-height="250"
            align-whole="center"
            row-key="_id"
            showOverflowTooltip
            table-layout="auto"
            :loading="propertyLoading"
            :data="propDataList"
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
                :icon="useRenderIcon(EditPen)"
                @click="openPropDialog('修改', row)"
              >
                修改
              </el-button>
              <el-popconfirm
                title="是否确认删除"
                @confirm="handlePropDelete(row)"
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
            </template>
          </pure-table>
        </template>
      </PureTableBar>
      <!-- 命令列表 -->
      <PureTableBar
        title="命令列表"
        :columns="comColumns"
        :tableRef="commandTableRef?.getTableRef()"
      >
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openComDialog()"
          >
            新增命令
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="commandTableRef"
            border
            max-height="250"
            align-whole="center"
            row-key="_id"
            showOverflowTooltip
            table-layout="auto"
            :loading="comLoading"
            :data="comDataList"
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
                :icon="useRenderIcon(EditPen)"
                @click="openComDialog('修改', row)"
              >
                修改
              </el-button>
              <el-popconfirm
                title="是否确认删除"
                @confirm="handleComDelete(row)"
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
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </el-card>

    <el-card class="mt-3">
      <template #header>
        <h3>预置Topic</h3>
      </template>
      <pure-table
        border
        max-height="400"
        align-whole="center"
        row-key="_id"
        showOverflowTooltip
        table-layout="auto"
        :data="preTopicList"
        :columns="preTopicColumns"
        :span-method="objectSpanMethod"
        :header-cell-style="{
          background: 'var(--el-fill-color-light)',
          color: 'var(--el-text-color-primary)'
        }"
      />
    </el-card>
  </div>
</template>
