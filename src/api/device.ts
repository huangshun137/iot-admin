import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import type { ProductInfo } from "./product";
import type { OTATaskInfo } from "./ota";

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
  /** 设备软件版本 */
  version: string;
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

// 设备信息（带设备执行任务）
export interface DeviceInfoWithOTATask extends DeviceInfo {
  /** 设备执行中的OTA任务列表 */
  activeOTAs: OTATaskInfo[];
  /** 设备是否有执行中的OTA任务 */
  hasActiveOTA: boolean;
}
// 设备详情接口返回类型
export type DeviceInfoWithOTATaskResult = {
  success: boolean;
  data: DeviceInfoWithOTATask[];
};

// OTA设备信息
export type OTADeviceInfo = {
  /** 设备信息 */
  device: DeviceInfo;
  /** OTA任务信息 */
  otaTask: OTATaskInfo;
  /** 设备OTA状态 */
  status: string;
  /** 设备OTA信息描述 */
  description: string;
};
// OTA设备列表接口返回类型
export type OTADeviceInfoResult = {
  success: boolean;
  data: OTADeviceInfo[];
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

/** 获取设备OTA列表 */
export const getDeviceWithOTAList = (data?: object) => {
  return http.request<DeviceInfoWithOTATaskResult>(
    "get",
    baseUrlApi("devices/getDataWidthOTATask"),
    {
      params: data
    }
  );
};

/** 获取设备OTA列表 */
export const getOTADeviceList = (data?: object) => {
  return http.request<OTADeviceInfoResult>(
    "get",
    baseUrlApi("devices/getOTADeviceList"),
    {
      params: data
    }
  );
};
