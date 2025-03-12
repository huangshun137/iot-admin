import {
  type ComputedRef,
  onMounted,
  onUnmounted,
  type Ref,
  ref,
  watch
} from "vue";
import { useRoute } from "vue-router";
import { getDeviceDetail, type DeviceInfo } from "@/api/device";
import {
  getProductPropertyList,
  type ProductPropertyInfo
} from "@/api/product";
import useMqtt from "@/utils/useMqtt";

export function useDeviceDetail() {
  const route = useRoute();
  const deviceId = route.params.id as string;
  const loading = ref(false);
  const deviceDetail = ref<DeviceInfo>({} as DeviceInfo);

  const onGetDetailInfo = async () => {
    loading.value = true;
    const { data } = await getDeviceDetail(deviceId);
    deviceDetail.value = data;
    loading.value = false;
  };

  onMounted(() => {
    onGetDetailInfo();
  });

  return {
    loading,
    deviceDetail
  };
}

export function usePropertyInfo(productIdRef: ComputedRef<string>) {
  const loading = ref(false);
  const propertyList = ref<ProductPropertyInfo[]>([]);
  async function onGetPorpertyList(id: string) {
    loading.value = true;
    const { data } = await getProductPropertyList({ productId: id });
    propertyList.value = data;
    loading.value = false;
  }

  watch(
    productIdRef,
    async newId => {
      newId && (await onGetPorpertyList(newId));
    },
    { immediate: true }
  );
  return { loading, propertyList };
}

export function useMqttPropertyInfo(deviceDetail: Ref<DeviceInfo>) {
  const { initMqtt, isConnected, messages, subscribeToTopic, disconnect } =
    useMqtt();

  const propertyInfo = ref<any>({});

  onMounted(() => {
    initMqtt();
  });

  // MQTT连接后订阅消息
  watch(
    () => [isConnected.value, deviceDetail.value?.deviceId],
    ([connected, deviceId]) => {
      if (connected && deviceId) {
        // 设备上报的信息
        subscribeToTopic(`/devices/${deviceId}/sys/messages/up`);
        // 设备上报的属性信息
        subscribeToTopic(`/devices/${deviceId}/sys/properties/report`);
      }
    }
  );

  // mqtt消息监听
  watch(
    () => messages.value,
    newMessages => {
      // 处理消息
      newMessages.forEach(message => {
        if (message.topic.indexOf("/sys/messages/up") > -1) {
          // 上报信息
          console.log("消息上报", message.msg);
        } else if (message.topic.indexOf("/sys/properties/report") > -1) {
          // 属性上报
          console.log("属性上报", message.msg);
          propertyInfo.value = message.msg;
        }
      });
    },
    { deep: true }
  );

  onUnmounted(() => {
    // 在组件卸载时断开 MQTT 连接
    disconnect();
  });
  return { propertyInfo };
}
