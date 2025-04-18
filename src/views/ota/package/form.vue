<script setup lang="ts">
import { nextTick, reactive, ref, watch } from "vue";
import { FormRules } from "element-plus";
import ReCol from "@/components/ReCol";
import { ProductInfo } from "@/api/product";
import { PackageInfo } from "@/api/ota";
import UploadIcon from "@iconify-icons/ri/upload-2-line";
import { message } from "@/utils/message";

interface FormInline
  extends Omit<PackageInfo, "createdAt" | "product" | "filePath"> {
  fileList: File[];
  productId: string;
}
interface FormProps {
  formInline: FormInline;
  productList: ProductInfo[];
}

const formRules = reactive<FormRules>({
  productId: [{ required: true, message: "产品为必填项" }],
  version: [{ required: true, message: "资源包版本为必填项" }],
  name: [{ required: true, message: "资源包名称为必填项" }],
  fileList: [
    {
      required: true,
      message: "资源包为必填项",
      type: "array"
    }
  ]
});

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    _id: null,
    name: "",
    version: "",
    description: "",
    fileList: [],
    productId: ""
  }),
  productList: () => [] as ProductInfo[]
});

const ruleFormRef = ref();
const uploadRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

watch(
  () => newFormInline.value.fileList,
  newValue => {
    console.log(newValue);
    if (newValue.length) {
      // 压缩包校验逻辑
      const allowedExtensions = ["zip", "rar", "7z", "7zip"];
      const extension = newValue[0].name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        message("仅允许上传压缩包文件", { type: "error" });
        newFormInline.value.fileList = [];
        return;
      }
      if (newValue[0].size > 100 * 1024 * 1024) {
        message("压缩包文件大小不能超过100MB", { type: "error" });
      }
    }
    ruleFormRef.value.validateField(["fileList"]);
    if (!!newValue.length) {
      const lastDotIndex = newValue[0].name.lastIndexOf(".");
      newFormInline.value.name = newValue[0].name.substring(0, lastDotIndex);
    } else {
      newFormInline.value.name = "";
    }
  }
);

defineExpose({ getRef });
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
        <el-form-item label="选择产品" prop="productId">
          <el-select
            v-model="newFormInline.productId"
            placeholder="请选择产品"
            class="w-full"
          >
            <el-option
              v-for="item in props.productList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="资源包上传" prop="fileList">
          <el-upload
            ref="uploadRef"
            v-model:file-list="newFormInline.fileList"
            drag
            multiple
            action="#"
            class="w-full"
            :limit="1"
            :auto-upload="false"
            :on-exceed="() => message('只能上传一个文件', { type: 'warning' })"
          >
            <div class="el-upload__text">
              <IconifyIconOffline
                :icon="UploadIcon"
                width="26"
                class="m-auto mb-2"
              />
              可点击或拖拽上传
              <p style="font-size: 12px">
                (仅支持上传压缩包：ZIP/RAR/7z，且文件大小不能超过100MB)
              </p>
            </div>
          </el-upload>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="资源包版本" prop="version">
          <el-input
            v-model="newFormInline.version"
            placeholder="请输入资源包版本"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="资源包名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            placeholder="请输入资源包名称"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="资源包入口文件" prop="entry">
          <el-input
            v-model="newFormInline.entry"
            placeholder="请输入资源包入口文件（默认为main.py）"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="描述">
          <el-input
            v-model="newFormInline.description"
            placeholder="请输入描述"
            type="textarea"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
  align-items: center;
}
</style>
