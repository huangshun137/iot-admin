// 产品属性/命令参数 类型
export const ProductPropertyTypeList = [
  { label: "int(整型)", value: "int" },
  // { label: "long(长整型)", value: "long" },
  { label: "decimal(小数)", value: "decimal" },
  { label: "string(字符串)", value: "string" },
  { label: "jsonObject(JSON结构体)", value: "jsonObject" },
  { label: "boolean(布尔)", value: "boolean" }
];

// 数字类型
export const NumberTypeList = ["int", "long", "decimal"];

// OTA任务状态
export const OtaTaskStatusList = [
  { label: "待执行", value: "pending" },
  { label: "执行中", value: "running" },
  { label: "已完成", value: "completed" },
  { label: "已取消", value: "canceled" },
  { label: "停止中", value: "stopping" },
  { label: "执行失败", value: "failed" }
];
