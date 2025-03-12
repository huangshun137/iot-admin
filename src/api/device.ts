import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import type { ProductInfo } from "./product";

// 设备信息
export type DeviceInfo = {
  /** 设备名称 */
  name: string;
  /** 设备表id */
  _id: string;
  /** 设备标识码 */
  code: string;
  /** 设备ID */
  deviceId: string;
  product: ProductInfo;
  /** 产品id */
  productId: string;
  /** 设备描述 */
  description: string;
  createdAt: Date;
};
// 设备列表接口返回类型
export type DeviceListResult = {
  success: boolean;
  data: DeviceInfo[];
};
// 设备详情接口返回类型
export type DeviceDetailResult = {
  success: boolean;
  data: DeviceInfo;
};

/** 获取设备列表 */
export const getDeviceList = (data?: object) => {
  return http.request<DeviceListResult>("get", baseUrlApi("devices"), {
    params: data
  });
};

/** 新增/更新设备信息 */
export const addOrUpdateDeviceInfo = (data: object) => {
  return http.request("post", baseUrlApi("devices"), { data });
};

/** 删除设备信息 */
export const deleteDeviceInfo = (id: string) => {
  return http.request("delete", baseUrlApi(`devices/${id}`));
};

/** 获取设备详情 */
export const getDeviceDetail = (id: string) => {
  return http.request<DeviceDetailResult>("get", baseUrlApi(`devices/${id}`));
};
