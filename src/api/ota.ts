import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import type { ProductInfo } from "./product";
import type { PureHttpRequestConfig } from "@/utils/http/types";

// OTA 资源包信息
export type PackageInfo = {
  /** 资源包名称 */
  name: string;
  /** 资源包id */
  _id: string;
  /** 资源包版本 */
  version: string;
  /** 资源包描述 */
  description: string;
  /** 资源包所属产品 */
  product: ProductInfo;
  /** 资源包存储地址 */
  filePath: string;
  /** 资源包上传时间 */
  createdAt: Date;
};
// 资源包列表接口返回类型
export type PackageListResult = {
  success: boolean;
  data: PackageInfo[];
};

// OTA 任务信息
export type OTATaskInfo = {
  /** 任务名称 */
  name: string;
  /** 任务id */
  _id: string;
  /** 任务状态 */
  status: string;
  /** 任务资源包 */
  package: PackageInfo;
  /** 任务升级设备 */
  deviceList: string[];
  /** 资源包上传时间 */
  createdAt: Date;
};
// 任务列表接口返回类型
export type OTATaskInfoResult = {
  success: boolean;
  data: OTATaskInfo[];
};

export type BlobWithFilename = Blob & { filename: string };

/** 获取资源包列表 */
export const getPackageList = (data?: object) => {
  return http.request<PackageListResult>("get", baseUrlApi("packages"), {
    params: data
  });
};

/** 新增资源包 */
export const addPackageInfo = (data?: object) => {
  return http.request<PackageListResult>("post", baseUrlApi("packages"), {
    data,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 下载资源包 */
export const downloadPackageInfo = (id: string) => {
  return http.request<BlobWithFilename>(
    "get",
    baseUrlApi(`packages/download/${id}`),
    {
      responseType: "blob",
      beforeResponseCallback: response => {
        if (response.status === 200) {
          const contentDisposition = response.headers["content-disposition"];
          const filename = contentDisposition.split("filename=")[1];
          response.data.filename = filename.replace(/['"]/g, "");
        }
      }
    } as PureHttpRequestConfig
  );
};

/** 删除资源包 */
export const deletePackageInfo = (id: string) => {
  return http.request<PackageListResult>(
    "delete",
    baseUrlApi(`packages/${id}`)
  );
};

/** 获取任务列表 */
export const getOTATaskList = (data?: object) => {
  return http.request<OTATaskInfoResult>("get", baseUrlApi("otaTasks"), {
    params: data
  });
};

/** 新增任务 */
export const addOTATaskInfo = (data?: object) => {
  return http.request("post", baseUrlApi("otaTasks"), {
    data
  });
};

/** 删除任务 */
export const deleteOTATaskInfo = (id: string) => {
  return http.request("delete", baseUrlApi(`otaTasks/${id}`));
};

/** 重启单个设备升级任务 */
export const retryDeviceOTATask = (id: string) => {
  return http.request<CommonResponse>(
    "post",
    baseUrlApi(`otaTasks/retry/${id}`)
  );
};

/** 终止单个设备升级任务 */
export const stopDeviceOTATask = (id: string) => {
  return http.request<CommonResponse>(
    "post",
    baseUrlApi(`otaTasks/stop/${id}`)
  );
};
