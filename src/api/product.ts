import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

// 产品信息
export type ProductInfo = {
  /** 产品名称 */
  name: string;
  /** 产品id */
  _id: string;
  /** 产品状态 */
  status: string;
  /** 设备类型 */
  type: string;
  /** 协议类型 */
  protocal: string;
  createdAt: Date;
};
// 产品列表接口返回类型
export type ProductListResult = {
  success: boolean;
  data: ProductInfo[];
};
// 产品详情接口返回类型
export type ProductResult = {
  success: boolean;
  data: ProductInfo;
};

// 属性信息
export type ProductPropertyInfo = {
  _id: string;
  name: string;
  type: string;
  accessMethod: string[];
  description: string;
  dataRange: number[];
  createdAt: Date;
};
// 属性列表接口返回类型
export type ProductPropertyResult = {
  success: boolean;
  data: ProductPropertyInfo[];
};

// 命令参数信息
export type ProductParamInfo = {
  _id: string;
  name: string;
  type: string;
  description: string;
  dataRange: number[];
  createdAt: Date;
};
// 命令参数列表接口返回类型
export type ProductParamResult = {
  success: boolean;
  data: ProductParamInfo[];
};
// 命令信息
export type ProductCommandInfo = {
  _id: string;
  name: string;
  reqParams: ProductParamInfo[];
  resParams: ProductParamInfo[];
  createdAt: Date;
};
// 命令列表接口返回类型
export type ProductCommandResult = {
  success: boolean;
  data: ProductCommandInfo[];
};

/** 获取产品列表 */
export const getProductList = (data?: object) => {
  return http.request<ProductListResult>("get", baseUrlApi("products"), {
    params: data
  });
};

/** 新增/更新产品信息 */
export const addOrUpdateProductInfo = (data: object) => {
  return http.request("post", baseUrlApi("products"), { data });
};

/** 删除产品信息 */
export const deleteProductInfo = (id: string) => {
  return http.request("delete", baseUrlApi(`products/${id}`));
};

/** 获取产品详情 */
export const getProductDetail = (id: string) => {
  return http.request<ProductResult>("get", baseUrlApi(`products/${id}`));
};

/** 获取产品属性信息 */
export const getProductPropertyList = (data: object) => {
  return http.request<ProductPropertyResult>("get", baseUrlApi(`properties`), {
    params: data
  });
};

/** 新增/更新产品属性信息 */
export const addOrUpdateProductProperty = (data: object) => {
  return http.request("post", baseUrlApi(`properties`), {
    data
  });
};

/** 删除产品属性信息 */
export const deleteProductProperty = (id: string) => {
  return http.request("delete", baseUrlApi(`properties/${id}`));
};

/** 获取产品命令信息 */
export const getProductCommandList = (data: object) => {
  return http.request<ProductCommandResult>("get", baseUrlApi(`commands`), {
    params: data
  });
};

/** 新增/更新产品命令信息 */
export const addOrUpdateProductCommand = (data: object) => {
  return http.request("post", baseUrlApi(`commands`), {
    data
  });
};

/** 删除产品命令信息 */
export const deleteProductCommand = (id: string) => {
  return http.request("delete", baseUrlApi(`commands/${id}`));
};

/** 获取命令下发参数信息 */
export const getCommandReqParamList = (data: object) => {
  return http.request<ProductCommandResult>("get", baseUrlApi(`reqParams`), {
    params: data
  });
};

/** 新增/更新命令下发参数信息 */
export const addOrUpdateCommandReqParam = (data: object) => {
  return http.request("post", baseUrlApi(`reqParams`), {
    data
  });
};

/** 删除命令下发参数信息 */
export const deleteCommandReqParam = (id: string) => {
  return http.request("delete", baseUrlApi(`reqParams/${id}`));
};

/** 获取命令响应参数信息 */
export const getCommandResParamList = (data: object) => {
  return http.request<ProductCommandResult>("get", baseUrlApi(`resParams`), {
    params: data
  });
};

/** 新增/更新命令响应参数信息 */
export const addOrUpdateCommandResParam = (data: object) => {
  return http.request("post", baseUrlApi(`resParams`), {
    data
  });
};

/** 删除命令响应参数信息 */
export const deleteCommandResParam = (id: string) => {
  return http.request("delete", baseUrlApi(`resParams/${id}`));
};
