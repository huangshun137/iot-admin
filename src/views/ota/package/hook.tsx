import {
  addPackageInfo,
  deletePackageInfo,
  downloadPackageInfo,
  getPackageList,
  type PackageInfo
} from "@/api/ota";
import { getProductList } from "@/api/product";
import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";
import { calculateFileMD5 } from "@/utils/others";
import {
  cloneDeep,
  createFormData,
  deviceDetection,
  // downloadByUrl,
  downloadByData,
  isAllEmpty
} from "@pureadmin/utils";
import dayjs from "dayjs";
import { ElLoading } from "element-plus";
import { h, onMounted, reactive, ref } from "vue";
import editForm from "./form.vue";

export function usePackage() {
  const form = reactive({
    name: "",
    productName: ""
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const productList = ref([]);

  const columns: TableColumnList = [
    {
      label: "软件ID",
      prop: "_id",
      minWidth: 200
    },
    {
      label: "软件名称",
      prop: "name",
      align: "left",
      minWidth: 100
    },
    {
      label: "版本",
      prop: "version",
      width: 120
    },
    {
      label: "产品ID",
      prop: "productId",
      minWidth: 200,
      cellRenderer: ({ row }) => row.product?._id
    },
    {
      label: "产品名称",
      prop: "productId",
      width: 120,
      cellRenderer: ({ row }) => row.product?.name
    },
    {
      label: "软件入口文件",
      prop: "entry",
      width: 120
    },
    {
      label: "描述",
      prop: "description",
      width: 120
    },
    {
      label: "上传时间",
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

  async function getProductListInfo() {
    const { data } = await getProductList({ status: 1 });
    productList.value = data;
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getPackageList();
    let newData = data;
    if (!isAllEmpty(form.name)) {
      // 前端搜索资源包名称
      newData = newData.filter(item => item.name.includes(form.name));
    }
    if (!isAllEmpty(form.productName)) {
      // 前端搜索产品名称
      newData = newData.filter(item =>
        item.product?.name?.includes(form.productName)
      );
    }
    dataList.value = cloneDeep(newData);
    loading.value = false;
  }

  function openDialog(title = "上传", row?: PackageInfo) {
    addDialog({
      title: `资源包${title}`,
      props: {
        formInline: {
          _id: row?._id ?? null,
          name: row?.name ?? "",
          version: row?.version ?? "",
          description: row?.description ?? "",
          productId: row?.product?._id ?? "",
          entry: row?.entry,
          createdAt: row?.createdAt ?? new Date()
        },
        productList: productList.value
      },
      width: "60%",
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
          message("操作成功", {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            // 表单规则校验通过
            console.log("curData", curData);
            const params = {
              ...curData,
              entry: curData.entry ? curData.entry.trim() : "main.py"
            };
            if (!!params.fileList?.length) {
              params.file = params.fileList[0].raw;
              params.md5 = await calculateFileMD5(params.file);
            }
            delete params.fileList;
            if (!params._id) {
              delete params._id;
            }
            const loading = ElLoading.service({
              lock: true,
              text: "Loading"
            });
            const formData = createFormData(params);
            console.log(formData);
            addPackageInfo(formData)
              .then(() => {
                chores();
              })
              .finally(() => {
                loading.close();
              });
          }
        });
      }
    });
  }

  function handleDelete(row) {
    deletePackageInfo(row._id)
      .then(() => {
        message("操作成功", { type: "success" });
        onSearch();
      })
      .catch(err => {
        console.log(err);
        message(err.response?.data?.error || "操作失败", { type: "error" });
      });
  }

  function handleDownload(row) {
    // const path: string = import.meta.env.VITE_DOWNLOAD_PATH + row.filePath;
    // const lastIndexOf = path.lastIndexOf(".");
    // const extname =
    //   lastIndexOf === -1 ? "" : path.substring(path.lastIndexOf("."));
    // downloadByUrl(path, row.name + extname);
    downloadPackageInfo(row._id)
      .then(data => {
        console.log(data);
        downloadByData(data, data.filename);
      })
      .catch(err => {
        console.log(err);
        message("下载文件失败", { type: "error" });
      });
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
    handleDownload
  };
}
