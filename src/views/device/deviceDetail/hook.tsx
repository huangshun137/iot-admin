import {
  addOrUpdateAgentDeviceInfo,
  type AgentDeviceInfo,
  deleteAgentDeviceInfo,
  type DeviceInfo,
  getAgentDeviceList,
  getDeviceDetail,
  getDeviceList
} from "@/api/device";
import {
  getProductCommandList,
  getProductPropertyList,
  type ProductCommandInfo,
  type ProductPropertyInfo
} from "@/api/product";
import { addDialog } from "@/components/ReDialog";
import { message as MyMessage } from "@/utils/message";
import useMqtt from "@/utils/useMqtt";
import dayjs from "dayjs";
import {
  type ComputedRef,
  h,
  onMounted,
  onUnmounted,
  type Ref,
  ref,
  watch
} from "vue";
import { useRoute } from "vue-router";
import deviceForm from "./deviceForm.vue";
import editForm from "./form.vue";

export function useDeviceDetail() {
  const route = useRoute();
  const deviceId = route.params.id as string;
  const loading = ref(false);
  const deviceDetail = ref<DeviceInfo>({} as DeviceInfo);

  const onGetDetailInfo = async () => {
    loading.value = true;
    const { data } = await getDeviceDetail(deviceId);
    deviceDetail.value = data;
    loading.value = false;
  };

  onMounted(() => {
    onGetDetailInfo();
  });

  return {
    loading,
    deviceDetail
  };
}

export function usePropertyInfo(productIdRef: ComputedRef<string>) {
  const loading = ref(false);
  const propertyList = ref<ProductPropertyInfo[]>([]);
  async function onGetPorpertyList(id: string) {
    loading.value = true;
    const { data } = await getProductPropertyList({ productId: id });
    propertyList.value = data;
    loading.value = false;
  }

  watch(
    productIdRef,
    async newId => {
      newId && (await onGetPorpertyList(newId));
    },
    { immediate: true }
  );
  return { loading, propertyList };
}

export function useMqttPropertyInfo(
  deviceDetail: Ref<DeviceInfo>,
  propertyList: Ref<ProductPropertyInfo[]>,
  productIdRef: ComputedRef<string>
) {
  const {
    initMqtt,
    isConnected,
    subscribeToTopic,
    publishMessage,
    disconnect
  } = useMqtt(onMessage);

  const formRef = ref();
  // mqtt获取的属性信息
  const propertyInfo = ref<any>({});
  const commandList = ref<ProductCommandInfo[]>([]);

  // 发送mqtt时的时间戳（接受响应用）
  const request_id = ref(0);
  const dialogType = ref<"property" | "command">(null);
  const doneFn = ref<Function>(() => {});
  const closeLoadingFn = ref<Function>(() => {});

  async function onGetCommandList(productId) {
    const { data } = await getProductCommandList({ productId });
    commandList.value = data;
  }

  function openDialog(
    type: "property" | "command",
    propertyInfo?: ProductPropertyInfo
  ) {
    dialogType.value = type;
    addDialog({
      title: type === "property" ? "设置属性" : "下发命令",
      props: {
        formInline: {
          optionValue: propertyInfo?._id ?? null
        },
        type,
        propertyList: propertyList.value.filter(item =>
          item.accessMethod.includes("write")
        ),
        commandList: commandList.value
      },
      width: "50%",
      class: "my_dialog",
      draggable: true,
      sureBtnLoading: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(editForm, {
          ref: formRef,
          formInline: null,
          type,
          propertyList: [],
          commandList: []
        }),
      beforeSure: (done, { closeLoading }) => {
        const FormRef = formRef.value.getRef();
        const curData = formRef.value.getCurFormData();
        FormRef.validate(valid => {
          if (!valid) {
            closeLoading();
          } else {
            // 表单规则校验通过
            console.log("curData", curData);
            const selectedItem = (
              type === "command" ? commandList.value : propertyList.value
            ).find(item => item._id === curData.optionValue);
            if (selectedItem?.requestUrl) {
              curData.requestUrl = selectedItem.requestUrl;
            }
            if (selectedItem?.requestMethod) {
              curData.requestMethod = selectedItem.requestMethod;
            }
            const msg = JSON.stringify(curData);
            request_id.value = new Date().getTime();
            closeLoadingFn.value = closeLoading;
            doneFn.value = done;
            if (type === "command") {
              // 命令下发
              publishMessage(
                `/devices/${deviceDetail.value.deviceId}/sys/commands/request_id=${request_id.value}`,
                msg
              );
            } else {
              // 属性设置
              publishMessage(
                `/devices/${deviceDetail.value.deviceId}/sys/properties/set/request_id=${request_id.value}`,
                msg
              );
            }
            // done(); // 关闭弹框
          }
        });
      },
      closeCallBack: () => {
        closeLoadingFn.value && closeLoadingFn.value();
      }
    });
  }

  // mqtt消息监听
  function onMessage({ topic, msg }) {
    if (topic.indexOf("/sys/messages/up") > -1) {
      // 上报信息
    } else if (topic.indexOf("/sys/properties/report") > -1) {
      // 属性上报
      // console.log("属性上报", msg);
      propertyInfo.value = {
        ...msg,
        lastUpdate: dayjs().format("YYYY-MM-DD HH:mm:ss")
      };
    } else if (topic.indexOf("/sys/commands/response/request_id") > -1) {
      // 命令下发响应消息
      if (topic.indexOf(request_id.value.toString()) > -1) {
        if (msg.ok) {
          doneFn.value();
          MyMessage("命令已完成", {
            type: "success"
          });
        } else {
          MyMessage(msg.msg || "命令执行失败", {
            type: "error"
          });
          closeLoadingFn.value();
        }
        request_id.value = 0;
      }
    } else if (topic.indexOf("/sys/properties/set/response/request_id") > -1) {
      // 属性设置响应消息
      if (topic.indexOf(request_id.value.toString()) > -1) {
        if (msg.ok) {
          doneFn.value();
          MyMessage("属性设置已完成", {
            type: "success"
          });
        } else {
          MyMessage(msg.msg || "属性设置失败", {
            type: "error"
          });
          closeLoadingFn.value();
        }
        request_id.value = 0;
      }
    }
  }

  onMounted(async () => {
    initMqtt();
  });

  // 获取产品命令列表
  watch(
    productIdRef,
    productId => {
      productId && onGetCommandList(productId);
    },
    { deep: true, immediate: true }
  );

  // MQTT连接后订阅消息
  watch(
    () => [isConnected.value, deviceDetail.value?.deviceId],
    ([connected, deviceId]) => {
      if (connected && deviceId) {
        // 设备上报的信息
        subscribeToTopic(`/devices/${deviceId}/sys/messages/up`);
        // 设备上报的属性信息
        subscribeToTopic(`/devices/${deviceId}/sys/properties/report`);
      }
    }
  );

  watch(
    () => [request_id.value, deviceDetail.value?.deviceId],
    ([requestId, deviceId]) => {
      // 获取响应消息
      if (requestId && deviceId) {
        if (dialogType.value === "command") {
          subscribeToTopic(
            `/devices/${deviceId}/sys/commands/response/request_id=${requestId}`
          );
        } else {
          subscribeToTopic(
            `/devices/${deviceId}/sys/properties/set/response/request_id=${requestId}`
          );
        }
      }
    }
  );

  onUnmounted(() => {
    // 在组件卸载时断开 MQTT 连接
    disconnect();
  });
  return { propertyInfo, openDialog, publishMessage };
}

export function useDeviceAgent(deviceDetail, publishMessage) {
  const route = useRoute();
  const deviceId = route.params.id as string;

  const columns: TableColumnList = [
    {
      label: "自定义设备",
      prop: "isCustomDevice",
      width: 100,
      cellRenderer: ({ row }) => (row.isCustomDevice ? "是" : "否")
    },
    {
      label: "设备名称",
      prop: "deviceName",
      minWidth: 120,
      cellRenderer: ({ row }) =>
        row.isCustomDevice ? row.deviceName : row.device?.name || "--"
    },
    {
      label: "设备标识码",
      prop: "deviceCode",
      minWidth: 120,
      cellRenderer: ({ row }) => row.device?.code
    },
    {
      label: "运行目录",
      prop: "directory",
      minWidth: 120
    },
    {
      label: "入口文件名",
      prop: "entryName",
      minWidth: 120
    },
    {
      label: "运行环境",
      prop: "condaEnv",
      width: 100
    },
    {
      label: "启动命令",
      prop: "startCommand",
      width: 120
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  const formRef = ref();
  const loading = ref(false);
  const dataList = ref([]);
  const deviceList = ref([]);
  async function onGetDeviceList() {
    const { data } = await getDeviceList();
    deviceList.value = data.filter(item => item.product?.type !== "Agent");
  }
  async function getDeviceAgent() {
    loading.value = true;
    const { data } = await getAgentDeviceList({
      agentId: deviceId
    });
    dataList.value = data;
    loading.value = false;
  }

  function openDialog(title = "绑定", row?: AgentDeviceInfo) {
    addDialog({
      title: `${title}设备`,
      props: {
        formInline: {
          _id: row?._id ?? null,
          isCustomDevice: row?.isCustomDevice ?? false,
          device: row?.device,
          deviceId: row?.device?._id,
          deviceName: row?.deviceName ?? "",
          agentId: row?.agentId ?? "",
          directory: row?.directory ?? "",
          entryName: row?.entryName ?? "",
          condaEnv: row?.condaEnv,
          startCommand: row?.startCommand
        },
        deviceList: deviceList.value
      },
      width: "50%",
      draggable: true,
      contentRenderer: () =>
        h(deviceForm, {
          ref: formRef,
          formInline: null,
          deviceList: []
        }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline;

        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            console.log("curData", curData);
            addOrUpdateAgentDeviceInfo({ ...curData, agentId: deviceId })
              .then(() => {
                MyMessage("操作成功", {
                  type: "success"
                });
                done(); // 关闭弹框
                getDeviceAgent(); // 刷新表格数据
              })
              .catch(err => {
                console.log(err);
                MyMessage(err.response.data.message || "操作失败", {
                  type: "error"
                });
              });
          }
        });
      }
    });
  }

  function handleAgentDelete(row: AgentDeviceInfo) {
    deleteAgentDeviceInfo(row._id).then(() => {
      MyMessage("操作成功", { type: "success" });
      getDeviceAgent();
    });
  }

  function handleReset(row: AgentDeviceInfo) {
    const topic = `/devices/${deviceDetail.value.deviceId}/sys/messages/down`;
    const msg = {
      type: "restart",
      isCustomDevice: row.isCustomDevice,
      directory: row.directory,
      entryName: row.entryName,
      condaEnv: row.condaEnv,
      startCommand: row.startCommand
    };
    publishMessage(topic, JSON.stringify(msg), err => {
      if (err) {
        MyMessage(err || "操作失败", { type: "error" });
      } else {
        MyMessage("操作成功", { type: "success" });
      }
    });
  }

  onMounted(() => {
    onGetDeviceList();
    getDeviceAgent();
  });

  return {
    columns,
    loading,
    dataList,
    getDeviceAgent,
    openDialog,
    handleAgentDelete,
    handleReset
  };
}
