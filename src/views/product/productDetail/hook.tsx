import { h, onMounted, ref } from "vue";
import {
  getProductDetail,
  getProductPropertyList,
  type ProductPropertyInfo,
  type ProductInfo,
  addOrUpdateProductProperty,
  deleteProductProperty,
  type ProductCommandInfo,
  deleteProductCommand,
  addOrUpdateProductCommand,
  getProductCommandList,
  type ProductParamInfo,
  // addOrUpdateCommandReqParam,
  // addOrUpdateCommandResParam,
  getCommandReqParamList,
  getCommandResParamList
  // deleteCommandReqParam,
  // deleteCommandResParam
} from "@/api/product";
import { useRoute } from "vue-router";
import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";
import propertyForm from "./propertyForm.vue";
import commandForm from "./commandForm.vue";
import paramForm from "./paramForm.vue";
import { uuid } from "@pureadmin/utils";

export function useProductDetail() {
  const route = useRoute();
  const productId = route.params.id as string;
  const loading = ref(true);
  const productDetail = ref<ProductInfo>({} as ProductInfo);

  const onGetDetailInfo = async () => {
    loading.value = true;
    const { data } = await getProductDetail(productId);
    productDetail.value = data;
    loading.value = false;
  };

  onMounted(() => {
    onGetDetailInfo();
  });

  return {
    loading,
    productDetail
  };
}

export function usePropertyTable() {
  const route = useRoute();
  const productId = route.params.id as string;
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);

  const columns: TableColumnList = [
    {
      label: "属性名称",
      prop: "name",
      minWidth: 100
    },
    {
      label: "数据类型",
      prop: "type",
      minWidth: 100
    },
    {
      label: "访问方式",
      prop: "accessMode",
      minWidth: 100,
      cellRenderer: ({ row }) =>
        row.accessMethod
          .map(item => {
            return item === "read" ? "可读" : item === "write" ? "可写" : "";
          })
          .filter(Boolean)
          .join(",")
    },
    {
      label: "描述",
      prop: "description",
      minWidth: 100
    },
    {
      label: "操作",
      width: 150,
      slot: "operation"
    }
  ];

  async function onGetListData() {
    loading.value = true;
    const { data } = await getProductPropertyList({ productId });
    dataList.value = data;
    loading.value = false;
  }

  function handleDelete(row) {
    deleteProductProperty(row._id).then(() => {
      message(`您删除了属性名称为${row.name}的这条数据`, { type: "success" });
      onGetListData();
    });
  }

  function openDialog(title = "新增", row?: ProductPropertyInfo) {
    addDialog({
      title: `${title}属性`,
      props: {
        formInline: {
          _id: row?._id ?? null,
          name: row?.name ?? "",
          type: row?.type ?? "int",
          accessMethod: row?.accessMethod ?? [],
          description: row?.description ?? "",
          dataRange: row?.dataRange ?? [0, 65535]
        }
      },
      width: "50%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(propertyForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as ProductPropertyInfo;
        function chores() {
          message(`您${title}了属性名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onGetListData(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            console.log("curData", curData);
            addOrUpdateProductProperty({ ...curData, productId }).then(() => {
              chores();
            });
          }
        });
      }
    });
  }

  onMounted(() => {
    onGetListData();
  });

  return { columns, dataList, loading, handleDelete, openDialog };
}

const deleteParamsIds = ref({
  reqParams: [],
  resParams: []
});
export function useCommandTable() {
  const route = useRoute();
  const productId = route.params.id as string;
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);

  const columns: TableColumnList = [
    {
      label: "命令名称",
      prop: "name",
      minWidth: 100
    },
    {
      label: "下发参数",
      prop: "reqParams",
      minWidth: 100,
      cellRenderer: ({ row }) =>
        !row.reqParams || row.reqParams.length === 0
          ? "--"
          : row.reqParams.map(item => item.name).join(",")
    },
    {
      label: "响应参数",
      prop: "resParams",
      minWidth: 100,
      cellRenderer: ({ row }) =>
        !row.resParams || row.resParams.length === 0
          ? "--"
          : row.resParams.map(item => item.name).join(",")
    },
    {
      label: "操作",
      width: 150,
      slot: "operation"
    }
  ];

  async function onGetListData() {
    loading.value = true;
    const { data } = await getProductCommandList({ productId });
    dataList.value = data;
    loading.value = false;
  }

  function handleDelete(row) {
    deleteProductCommand(row._id).then(() => {
      message(`您删除了命令名称为${row.name}的这条数据`, { type: "success" });
      onGetListData();
    });
  }

  function openDialog(title = "新增", row?: ProductCommandInfo) {
    deleteParamsIds.value = {
      reqParams: [],
      resParams: []
    };
    addDialog({
      title: `${title}命令`,
      props: {
        formInline: {
          _id: row?._id ?? null,
          name: row?.name ?? ""
        }
      },
      width: "80%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(commandForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline;
        function chores() {
          message(`您${title}了命令名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onGetListData(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            const { reqParams, resParams } = formRef.value.getParamsList();
            const params = {
              ...curData,
              productId,
              deleteReqParamsIds: deleteParamsIds.value.reqParams,
              deleteResParamsIds: deleteParamsIds.value.resParams,
              reqParams: reqParams.map(item => ({
                ...item,
                _id: item._id.startsWith("-") ? null : item._id
              })),
              resParams: resParams.map(item => ({
                ...item,
                _id: item._id.startsWith("-") ? null : item._id
              }))
            };
            addOrUpdateProductCommand(params).then(() => {
              chores();
            });
          }
        });
      }
    });
  }

  onMounted(() => {
    onGetListData();
  });

  return { columns, dataList, loading, handleDelete, openDialog };
}

export function useParamTable(
  commandId: string,
  flag: "reqParams" | "resParams"
) {
  const formRef = ref();
  const loading = ref(true);

  const dataList = ref([]);

  function openDialog(title = "新增", row?: ProductParamInfo) {
    addDialog({
      title: `${title}参数`,
      props: {
        formInline: {
          _id: row?._id ?? null,
          name: row?.name ?? "",
          type: row?.type ?? "int",
          description: row?.description ?? "",
          dataRange: row?.dataRange ?? [0, 65535]
        }
      },
      width: "50%",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(paramForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline;
        // function chores() {
        //   message(`您${title}了参数名称为${curData.name}的这条数据`, {
        //     type: "success"
        //   });
        //   done(); // 关闭弹框
        //   onGetListData(); // 刷新表格数据
        // }
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            console.log("curData", curData);
            if (curData._id) {
              const itemIndex = dataList.value.findIndex(
                item => item._id === curData._id
              );
              dataList.value.splice(itemIndex, 1, curData);
            } else {
              dataList.value.push({
                ...curData,
                _id: "-" + uuid()
              });
            }
            done(); // 关闭弹框
            // if (flag === "reqParams") {
            //   addOrUpdateCommandReqParam({ ...curData, commandId }).then(() => {
            //     chores();
            //   });
            // } else {
            //   addOrUpdateCommandResParam({ ...curData, commandId }).then(() => {
            //     chores();
            //   });
            // }
          }
        });
      }
    });
  }

  async function onGetListData() {
    if (!commandId) {
      dataList.value = [];
      return;
    }
    loading.value = true;
    if (flag === "reqParams") {
      const { data } = await getCommandReqParamList({ commandId });
      dataList.value = data;
    } else {
      const { data } = await getCommandResParamList({ commandId });
      dataList.value = data;
    }
    loading.value = false;
  }
  function handleDelete(row) {
    dataList.value = dataList.value.filter(item => item._id !== row._id);
    if (!row._id || row._id.startsWith("-")) return;
    if (flag === "reqParams") {
      deleteParamsIds.value.reqParams.push(row._id);
      // deleteCommandReqParam(row._id).then(() => {
      //   message(`您删除了参数名称为${row.name}的这条数据`, { type: "success" });
      //   onGetListData();
      // });
    } else {
      deleteParamsIds.value.resParams.push(row._id);
      // deleteCommandResParam(row._id).then(() => {
      //   message(`您删除了参数名称为${row.name}的这条数据`, { type: "success" });
      //   onGetListData();
      // });
    }
  }

  onMounted(() => {
    onGetListData();
  });

  return { dataList, loading, openDialog, handleDelete };
}

export function useTopicList() {
  const preTopicColumns: TableColumnList = [
    {
      label: "Topic分类",
      prop: "group",
      minWidth: 120
    },
    {
      label: "Topic",
      prop: "topic",
      align: "left",
      minWidth: 300
    },
    {
      label: "发布者",
      prop: "publisher",
      width: 80
    },
    {
      label: "订阅者",
      prop: "subscriber",
      width: 80
    },
    {
      label: "用途",
      prop: "description",
      align: "left",
      minWidth: 150
    }
  ];
  const preTopicList = [
    {
      group: "设备消息相关Topic",
      topic: "/devices/{device_id}/sys/messages/up",
      publisher: "设备",
      subscriber: "平台",
      description: "设备消息上报"
    },
    {
      group: "设备消息相关Topic",
      topic: "/devices/{device_id}/sys/messages/down",
      publisher: "平台",
      subscriber: "设备",
      description: "平台下发消息给设备"
    },
    {
      group: "设备命令相关Topic",
      topic: "/devices/{device_id}/sys/commands/request_id={request_id}",
      publisher: "平台",
      subscriber: "设备",
      description: "平台下发命令给设备"
    },
    {
      group: "设备命令相关Topic",
      topic:
        "/devices/{device_id}/sys/commands/response/request_id={request_id}",
      publisher: "设备",
      subscriber: "平台",
      description: "设备返回命令响应"
    },
    {
      group: "设备属性相关Topic",
      topic: "/devices/{device_id}/sys/properties/report",
      publisher: "设备",
      subscriber: "平台",
      description: "设备上报属性数据"
    },
    {
      group: "设备属性相关Topic",
      topic: "/devices/{device_id}/sys/properties/set/request_id={request_id}",
      publisher: "平台",
      subscriber: "设备",
      description: "平台设置设备属性"
    },
    {
      group: "设备属性相关Topic",
      topic:
        "/devices/{device_id}/sys/properties/set/response/request_id={request_id}",
      publisher: "设备",
      subscriber: "平台",
      description: "属性设置的响应结果"
    },
    {
      group: "设备属性相关Topic",
      topic: "/devices/{device_id}/sys/properties/get",
      publisher: "平台",
      subscriber: "设备",
      description: "平台查询设备属性"
    },
    {
      group: "设备事件相关Topic",
      topic: "/devices/{device_id}/sys/events/up",
      publisher: "设备",
      subscriber: "平台",
      description: "设备事件上报"
    },
    {
      group: "设备事件相关Topic",
      topic: "/devices/{device_id}/sys/events/down",
      publisher: "平台",
      subscriber: "设备",
      description: "平台事件下发"
    }
  ];
  const objectSpanMethod = ({
    rowIndex,
    columnIndex,
    row
  }: SpanMethodProps) => {
    if (columnIndex === 0) {
      if (rowIndex === 0 || row.group !== preTopicList[rowIndex - 1].group) {
        const rowspan = preTopicList.filter(
          item => item.group === row.group
        ).length;
        return {
          rowspan,
          colspan: 1
        };
      } else {
        return {
          rowspan: 0,
          colspan: 0
        };
      }
    }
  };
  return { preTopicColumns, preTopicList, objectSpanMethod };
}
