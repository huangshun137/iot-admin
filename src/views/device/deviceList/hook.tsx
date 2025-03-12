import dayjs from "dayjs";
import editForm from "./form.vue";
import { message } from "@/utils/message";
import { getProductList } from "@/api/product";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import { cloneDeep, isAllEmpty, deviceDetection } from "@pureadmin/utils";
import router from "@/router";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import {
  addOrUpdateDeviceInfo,
  deleteDeviceInfo,
  getDeviceList,
  type DeviceInfo
} from "@/api/device";

export function useDevice() {
  const form = reactive({
    name: "",
    code: ""
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const productList = ref([]);

  const columns: TableColumnList = [
    {
      label: "设备名称",
      prop: "name",
      width: 120
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
      label: "状态",
      prop: "status",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={
            row.status === "online"
              ? "success"
              : row.status === "maintenance"
                ? "warning"
                : row.status === "offline"
                  ? "danger"
                  : "info"
          }
        >
          {row.status === "online"
            ? "在线"
            : row.status === "maintenance"
              ? "维修中"
              : row.status === "offline"
                ? "离线"
                : "未激活"}
        </el-tag>
      )
    },
    {
      label: "所属产品",
      prop: "productId",
      width: 120,
      cellRenderer: ({ row }) => row.product?.name
    },
    {
      label: "创建时间",
      minWidth: 200,
      prop: "createdAt",
      formatter: ({ createdAt }) =>
        dayjs(createdAt).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function getProductListInfo() {
    const { data } = await getProductList();
    productList.value = data;
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getDeviceList();
    let newData = data;
    if (!isAllEmpty(form.name)) {
      // 前端搜索设备名称
      newData = newData.filter(item => item.name.includes(form.name));
    }
    if (!isAllEmpty(form.code)) {
      // 前端搜索设备标识码
      newData = newData.filter(item => item.code === form.code);
    }
    dataList.value = cloneDeep(newData);
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  function openDialog(title = "注册", row?: DeviceInfo) {
    addDialog({
      title: `${title}设备`,
      props: {
        formInline: {
          _id: row?._id ?? null,
          name: row?.name ?? "",
          code: row?.code ?? "",
          deviceId: row?.deviceId ?? "",
          productId: row?.product?._id ?? "",
          description: row?.description ?? ""
        },
        productList: productList.value
      },
      width: "50%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(editForm, {
          ref: formRef,
          formInline: null,
          productList: []
        }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline;
        function chores() {
          message(`您${title}了设备名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            console.log("curData", curData);
            addOrUpdateDeviceInfo(curData).then(() => {
              chores();
            });
          }
        });
      }
    });
  }

  function handleDelete(row) {
    deleteDeviceInfo(row._id).then(() => {
      message(`您删除了设备名称为${row.name}的这条数据`, { type: "success" });
      onSearch();
    });
  }

  function handleDetail(row) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/device/detail/:id`,
      name: "DeviceDetail",
      params: { id: row._id },
      meta: {
        title: "设备详情"
      }
    });
    router.push(`/device/detail/${row._id}`);
  }

  onMounted(() => {
    getProductListInfo();
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改部门 */
    openDialog,
    /** 删除部门 */
    handleDelete,
    handleDetail
  };
}
