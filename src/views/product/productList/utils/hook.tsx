import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import {
  addOrUpdateProductInfo,
  deleteProductInfo,
  getProductList
} from "@/api/product";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h, computed } from "vue";
import {
  cloneDeep,
  isAllEmpty,
  deviceDetection,
  useDark
} from "@pureadmin/utils";
import type { FormItemProps } from "./types";
import router from "@/router";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";

const { isDark } = useDark();

const tagStyle = computed(() => {
  return (status: number) => {
    return status === 1
      ? {
          "--el-tag-text-color": isDark.value ? "#6abe39" : "#389e0d",
          "--el-tag-bg-color": isDark.value ? "#172412" : "#f6ffed",
          "--el-tag-border-color": isDark.value ? "#274a17" : "#b7eb8f"
        }
      : {
          "--el-tag-text-color": isDark.value ? "#e84749" : "#cf1322",
          "--el-tag-bg-color": isDark.value ? "#2b1316" : "#fff1f0",
          "--el-tag-border-color": isDark.value ? "#58191c" : "#ffa39e"
        };
  };
});

export function useProduct() {
  const form = reactive({
    name: "",
    status: null
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);

  const columns: TableColumnList = [
    {
      label: "产品名称",
      prop: "name",
      width: 180,
      align: "left"
    },
    {
      label: "产品ID",
      prop: "_id",
      minWidth: 200
    },
    {
      label: "设备类型",
      prop: "type",
      width: 100
    },
    {
      label: "协议类型",
      prop: "protocal",
      width: 100
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
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

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getProductList();
    let newData = data;
    if (!isAllEmpty(form.name)) {
      // 前端搜索部门名称
      newData = newData.filter(item => item.name.includes(form.name));
    }
    if (!isAllEmpty(form.status)) {
      // 前端搜索状态
      newData = newData.filter(item => item.status === form.status);
    }
    dataList.value = cloneDeep(newData);
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}产品`,
      props: {
        formInline: {
          _id: row?._id ?? null,
          name: row?.name ?? "",
          protocal: row?.protocal ?? "MQTT",
          type: row?.type ?? "",
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      width: "50%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了产品名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            console.log("curData", curData);
            addOrUpdateProductInfo(curData).then(() => {
              chores();
            });
          }
        });
      }
    });
  }

  function handleDelete(row) {
    deleteProductInfo(row._id).then(() => {
      message(`您删除了产品名称为${row.name}的这条数据`, { type: "success" });
      onSearch();
    });
  }

  function handleDetail(row) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/product/detail/:id`,
      name: "ProductDetail",
      params: { id: row._id },
      meta: {
        title: "产品详情"
      }
    });
    router.push(`/product/detail/${row._id}`);
  }

  onMounted(() => {
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
    handleDetail,
    handleSelectionChange
  };
}
