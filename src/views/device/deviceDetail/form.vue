<script setup lang="ts">
import {
  getCommandReqParamList,
  ProductCommandInfo,
  ProductPropertyInfo
} from "@/api/product";
import ReCol from "@/components/ReCol";
import { NumberTypeList } from "@/utils/const";
import { cloneDeep } from "@pureadmin/utils";
import { ref } from "vue";

interface FormInline {
  optionValue: string | null;
  [key: string]: any;
}

interface FormProps {
  formInline: FormInline;
  type: "property" | "command";
  propertyList: ProductPropertyInfo[];
  commandList: ProductCommandInfo[];
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    optionValue: null
  }),
  type: () => "command",
  propertyList: () => [],
  commandList: () => []
});

const ruleFormRef = ref();
const newFormInline = ref(cloneDeep(props.formInline));
const dynamicFormItems = ref([]);
const propertyInfo = ref<ProductPropertyInfo>(
  props.formInline.optionValue
    ? props.propertyList.find(item => item._id === props.formInline.optionValue)
    : null
);

function handleOptionChange() {
  if (props.type === "command") {
    // 获取命令下发参数信息
    getCommandReqParamList({
      commandId: newFormInline.value.optionValue
    }).then(res => {
      dynamicFormItems.value = res.data;
      newFormInline.value = res.data.reduce(
        (acc, cur) => {
          acc[cur.name] = null;
          return acc;
        },
        { optionValue: newFormInline.value.optionValue }
      );
    });
  } else {
    // 获取属性参数信息
    propertyInfo.value = props.propertyList.find(
      item => item._id === newFormInline.value.optionValue
    );
    newFormInline.value = {
      optionValue: newFormInline.value.optionValue
    };
    if (propertyInfo.value) {
      newFormInline.value[propertyInfo.value.name] = null;
    }
  }
}

function getRef() {
  return ruleFormRef.value;
}
function getCurFormData() {
  return cloneDeep(newFormInline.value);
}

defineExpose({ getRef, getCurFormData });
</script>

<template>
  <el-form ref="ruleFormRef" :model="newFormInline" label-width="120px">
    <el-row :gutter="40">
      <re-col>
        <el-form-item
          :label="`选择${props.type === 'property' ? '属性' : '命令'}`"
          prop="optionValue"
          :rules="[
            {
              required: true,
              message: `${props.type === 'property' ? '属性' : '命令'}为必填项`,
              trigger: 'blur'
            }
          ]"
        >
          <el-select
            v-model="newFormInline.optionValue"
            :placeholder="`请选择${props.type === 'property' ? '属性' : '命令'}`"
            class="w-full"
            :disabled="!!props.formInline.optionValue"
            @change="handleOptionChange"
          >
            <el-option
              v-for="item in props.type === 'property'
                ? props.propertyList
                : props.commandList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <template v-if="props.type === 'command'">
        <re-col>
          <el-form-item
            v-if="dynamicFormItems.length === 0"
            label="设置命令参数"
          >
            无命令参数
          </el-form-item>
          <template v-else>
            <el-form-item
              v-for="(item, key) in dynamicFormItems"
              :key="key"
              :label="item.name"
              :prop="item.name"
              :rules="[
                {
                  required: true,
                  message: `${item.name}为必填项`,
                  trigger: 'blur'
                },
                ...(NumberTypeList.includes(item.type)
                  ? item.dataRange?.length > 0
                    ? [
                        {
                          min: item.dataRange[0],
                          message: `取值范围为${item.dataRange[0]}~${item.dataRange[1]}`,
                          type: 'number'
                        },
                        {
                          max: item.dataRange[1],
                          message: `取值范围为${item.dataRange[0]}~${item.dataRange[1]}`,
                          type: 'number'
                        }
                      ]
                    : []
                  : item.type === 'boolean' || !item.length
                    ? []
                    : [
                        {
                          max: item.length,
                          message: `最大长度为${item.length}`
                        }
                      ])
              ]"
            >
              <el-input-number
                v-if="NumberTypeList.includes(item.type)"
                v-model="newFormInline[item.name]"
                :controls="false"
                class="!w-full"
              />
              <el-select
                v-else-if="item.type === 'boolean'"
                v-model="newFormInline[item.name]"
                class="!w-full"
              >
                <el-option label="True" :value="true" />
                <el-option label="False" :value="false" />
              </el-select>
              <el-input
                v-else
                v-model="newFormInline[item.name]"
                class="!w-full"
                type="textarea"
                :placeholder="item.description"
              />
            </el-form-item>
          </template>
        </re-col>
      </template>
      <template v-else>
        <re-col>
          <el-form-item v-if="!propertyInfo" label="设置属性参数">
            无属性参数
          </el-form-item>
          <el-form-item
            v-else
            label="设置属性参数"
            :prop="propertyInfo.requestParam || propertyInfo.name"
            :rules="[
              {
                required: true,
                message: '属性参数为必填项',
                trigger: 'blur'
              },
              ...(NumberTypeList.includes(propertyInfo.type)
                ? propertyInfo.dataRange?.length > 0
                  ? [
                      {
                        min: propertyInfo.dataRange[0],
                        message: `取值范围为${propertyInfo.dataRange[0]}~${propertyInfo.dataRange[1]}`,
                        type: 'number'
                      },
                      {
                        max: propertyInfo.dataRange[1],
                        message: `取值范围为${propertyInfo.dataRange[0]}~${propertyInfo.dataRange[1]}`,
                        type: 'number'
                      }
                    ]
                  : []
                : propertyInfo.type === 'boolean' || !propertyInfo.length
                  ? []
                  : [
                      {
                        max: propertyInfo.length,
                        message: `最大长度为${propertyInfo.length}`
                      }
                    ])
            ]"
          >
            <el-input-number
              v-if="NumberTypeList.includes(propertyInfo.type)"
              v-model="
                newFormInline[propertyInfo.requestParam || propertyInfo.name]
              "
              :controls="false"
              class="!w-full"
            />
            <el-select
              v-else-if="propertyInfo.type === 'boolean'"
              v-model="
                newFormInline[propertyInfo.requestParam || propertyInfo.name]
              "
              class="!w-full"
            >
              <el-option label="True" :value="true" />
              <el-option label="False" :value="false" />
            </el-select>
            <el-input
              v-else
              v-model="
                newFormInline[propertyInfo.requestParam || propertyInfo.name]
              "
              class="!w-full"
              type="textarea"
            />
          </el-form-item>
        </re-col>
      </template>
    </el-row>
  </el-form>
</template>
