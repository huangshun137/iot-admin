import dayjs from "dayjs";
import editForm from "./form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h, watch, type Ref, onUnmounted } from "vue";
import { cloneDeep, isAllEmpty, deviceDetection } from "@pureadmin/utils";
import {
  addOTATaskInfo,
  getOTATaskList,
  deleteOTATaskInfo,
  type OTATaskInfo,
  getPackageList,
  type PackageInfo,
  retryDeviceOTATask,
  stopDeviceOTATask,
  stopOTATask
} from "@/api/ota";
import { getDeviceWithOTAList, getOTADeviceList } from "@/api/device";
import { OtaTaskStatusList } from "@/utils/const";
import { ElCheckbox, ElTooltip } from "element-plus";

export function useOTATask() {
  const form = reactive({
    name: "",
    status: ""
  });

  const formRef = ref();
  const timeoutId = ref(null);
  const dataList = ref([]);
  const loading = ref(true);
  const packageList = ref([]);
  const drawer = ref(false);
  const taskDetail = ref<OTATaskInfo>({} as OTATaskInfo);

  const columns: TableColumnList = [
    {
      label: "任务ID",
      prop: "_id",
      minWidth: 200
    },
    {
      label: "任务名称",
      prop: "name",
      align: "left",
      minWidth: 100
    },
    {
      label: "状态",
      prop: "status",
      width: 120,
      cellRenderer: ({ row }) =>
        OtaTaskStatusList.find(item => item.value === row.status)?.label ?? "--"
    },
    {
      label: "开始时间",
      width: 200,
      prop: "createdAt",
      formatter: ({ createdAt }) =>
        dayjs(createdAt).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 150,
      slot: "operation"
    }
  ];

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function getPackageListInfo() {
    const { data } = await getPackageList();
    packageList.value = data;
  }

  async function onSearch(timeoutFlag = false) {
    if (timeoutId.value) {
      clearInterval(timeoutId.value);
      timeoutId.value = null;
    }
    !timeoutFlag && (loading.value = true);
    const { data } = await getOTATaskList();
    let newData = data;
    if (!isAllEmpty(form.name)) {
      // 前端搜索任务名称
      newData = newData.filter(item => item.name.includes(form.name));
    }
    if (!isAllEmpty(form.status)) {
      // 前端搜索任务状态
      newData = newData.filter(item => item.status === form.status);
    }
    dataList.value = cloneDeep(newData);
    !timeoutFlag && (loading.value = false);
    if (drawer.value) {
      taskDetail.value = dataList.value.find(
        item => item._id === taskDetail.value._id
      );
    }
    if (!timeoutId.value) {
      timeoutId.value = setTimeout(() => onSearch(true), 3000);
    }
  }

  function openDialog(row?: OTATaskInfo) {
    addDialog({
      title: "新建任务",
      props: {
        formInline: {
          _id: row?._id ?? null,
          name: row?.name ?? "",
          createdAt: row?.createdAt ?? new Date()
        },
        packageList: packageList.value
      },
      width: "800px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(editForm, {
          ref: formRef,
          formInline: null,
          packageList: []
        }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline;
        const deviceData = formRef.value.getSelectedTableData();
        function chores() {
          message("操作成功", {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            if (deviceData.length === 0) {
              message("请选择设备", { type: "warning" });
              return;
            }
            const params = {
              ...curData,
              deviceIdList: deviceData.map(item => item._id)
            };
            addOTATaskInfo(params).then(() => {
              chores();
            });
          }
        });
      }
    });
  }

  function handleDetail(row) {
    taskDetail.value = row;
    drawer.value = true;
  }

  function handleStop(row) {
    stopOTATask(row._id).then(res => {
      if (res.success) {
        message("操作成功", { type: "success" });
        onSearch();
      }
    });
  }

  function handleDelete(row) {
    deleteOTATaskInfo(row._id).then(() => {
      message("操作成功", { type: "success" });
      onSearch();
    });
  }

  onMounted(() => {
    getPackageListInfo();
    onSearch();
  });

  onUnmounted(() => {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
      timeoutId.value = null;
    }
  });

  return {
    form,
    loading,
    columns,
    dataList,
    drawer,
    taskDetail,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改 */
    openDialog,
    /** 删除 */
    handleDelete,
    handleStop,
    handleDetail
  };
}

export function useTaskDevice(packageList: PackageInfo[], tableRef) {
  const dataList = ref([]);
  const loading = ref(false);
  const selectedPackageInfo = ref<PackageInfo>(null);

  const columns: TableColumnList = [
    {
      type: "selection",
      selectable: row => {
        return (
          !row.hasActiveOTA && row.version !== selectedPackageInfo.value.version
        );
      },
      cellRenderer: ({ row }) => {
        const isDisabled =
          row.hasActiveOTA || row.version === selectedPackageInfo.value.version;
        const tooltipContent = isDisabled
          ? row.hasActiveOTA
            ? "存在执行中的OTA任务"
            : "当前版本已升级到目标版本"
          : "";

        const _selectedRows = tableRef.value?.getTableRef()?.getSelectionRows();
        const isSelected = _selectedRows.some(
          selectedRow => selectedRow._id === row._id
        );

        // TODO::::::::暂时先用v-model绑定勾选状态，问题是行内选中会报错，但效果是好的
        // 如果不用v-model用checked绑定勾选状态，全选时页面单行选中状态不会改变
        return isDisabled ? (
          <ElTooltip content={tooltipContent} placement="top">
            <span class="disabled-checkbox-wrapper">
              <ElCheckbox disabled v-model={isSelected} />
            </span>
          </ElTooltip>
        ) : (
          <ElCheckbox
            v-model={isSelected}
            onChange={(checked: boolean) =>
              tableRef.value?.getTableRef()?.toggleRowSelection(row, checked)
            }
          />
        );
      }
    },
    {
      label: "设备名称",
      prop: "name",
      width: 120,
      cellRenderer: ({ row }) => row.name || "--"
    },
    {
      label: "设备标识码",
      prop: "code",
      minWidth: 100
    },
    {
      label: "设备ID",
      prop: "deviceId",
      minWidth: 200
    },
    {
      label: "所属产品",
      prop: "productId",
      width: 120,
      cellRenderer: ({ row }) => row.product?.name
    },
    {
      label: "软件版本",
      prop: "version",
      width: 120,
      cellRenderer: ({ row }) => row.version || "--"
    },
    {
      label: "当前任务",
      prop: "activeOTAs",
      width: 120,
      cellRenderer: ({ row }) =>
        row.activeOTAs
          ?.map(item => item.otaTask?.name)
          ?.filter(Boolean)
          ?.join(",") || "--"
    }
  ];

  function handlePackageChange(packageId) {
    selectedPackageInfo.value = packageList.find(
      item => item._id === packageId
    );
    getDeviceListInfo();
  }

  async function getDeviceListInfo() {
    if (!selectedPackageInfo.value?.product) {
      dataList.value = [];
      return;
    }
    loading.value = true;
    const { data } = await getDeviceWithOTAList({
      productId: selectedPackageInfo.value.product._id
    });
    dataList.value = data;
    loading.value = false;
  }

  return {
    columns,
    dataList,
    loading,
    handlePackageChange,
    getDeviceListInfo
  };
}

export function useTaskDetail(
  taskDetail: Ref<OTATaskInfo>,
  drawer: Ref<boolean>
) {
  const dataList = ref([]);
  const loading = ref(false);
  const timeoutId = ref(null);

  const columns: TableColumnList = [
    {
      label: "状态",
      prop: "status",
      width: 100,
      cellRenderer: ({ row }) =>
        OtaTaskStatusList.find(item => item.value === row.status)?.label ?? "--"
    },
    {
      label: "设备名称",
      prop: "name",
      width: 120,
      cellRenderer: ({ row }) => row.device?.name || "--"
    },
    {
      label: "设备ID",
      prop: "deviceId",
      minWidth: 150,
      cellRenderer: ({ row }) => row.device?.deviceId || ""
    },
    {
      label: "升级描述",
      prop: "description",
      minWidth: 200
    },
    {
      label: "操作",
      width: 150,
      slot: "operation"
    }
  ];

  watch(
    () => [taskDetail.value._id, drawer],
    ([value, drawer], [oldValue, oldDrawer]) => {
      (oldValue !== value || (drawer && !oldDrawer)) && getDeviceListInfo();
    }
  );

  async function getDeviceListInfo() {
    if (timeoutId.value) {
      clearInterval(timeoutId.value);
      timeoutId.value = null;
    }
    if (!taskDetail.value._id) return;
    loading.value = true;
    const { data } = await getOTADeviceList({ taskId: taskDetail.value._id });
    dataList.value = data;
    loading.value = false;
    if (
      !timeoutId.value &&
      (taskDetail.value.status === "running" ||
        taskDetail.value.status === "pending" ||
        taskDetail.value.status === "stopping")
    ) {
      timeoutId.value = setTimeout(getDeviceListInfo, 3000);
    }
  }

  function handleRetry(row) {
    retryDeviceOTATask({
      id: row._id,
      packageId: taskDetail.value.package._id
    })
      .then(res => {
        if (res.success) {
          message("操作成功", { type: "success" });
          getDeviceListInfo();
        }
      })
      .catch(err => {
        console.log(err);
        message(err.response?.data?.error || "操作失败", { type: "error" });
      });
  }

  function handleStop(row) {
    stopDeviceOTATask(row._id).then(res => {
      if (res.success) {
        message("操作成功", { type: "success" });
        getDeviceListInfo();
      }
    });
  }

  function handleDelete(row) {
    console.log(row);
  }

  onUnmounted(() => {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
      timeoutId.value = null;
    }
  });

  return {
    columns,
    dataList,
    loading,
    getDeviceListInfo,
    handleRetry,
    handleStop,
    handleDelete
  };
}
