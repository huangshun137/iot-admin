import mqtt from "mqtt";
import { ref } from "vue";
const { VITE_MQTT_BROKER } = import.meta.env;

interface MqttMessage {
  topic: string;
  msg: any;
}
export function useMqtt(onMessage: (msg: MqttMessage) => void) {
  const client = ref<mqtt.MqttClient | null>(null);
  const isConnected = ref(false);

  // 初始化 MQTT 客户端
  const initMqtt = (url?: string, options?: mqtt.IClientOptions) => {
    const _url = url || VITE_MQTT_BROKER;
    const _options = options || { path: "/mqtt" };
    if (!client.value) {
      client.value = mqtt.connect(_url, _options);
      client.value.on("connect", () => {
        isConnected.value = true;
        console.log("Connected to MQTT broker");
      });

      client.value.on("message", (topic, message) => {
        console.log(`Received message on topic ${topic}:`, message.toString());
        onMessage({
          topic,
          msg: JSON.parse(message.toString())
        });
      });

      client.value.on("error", err => {
        console.error("Error occurred:", err);
      });

      client.value.on("close", () => {
        isConnected.value = false;
        console.log("Disconnected from MQTT broker");
      });
    }
  };

  // 订阅主题
  const subscribeToTopic = (topic: string) => {
    if (client.value && isConnected.value) {
      client.value.subscribe(topic, err => {
        if (err) {
          console.error("Failed to subscribe to topic:", topic, err);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    }
  };

  // 发布消息
  const publishMessage = (
    topic: string,
    message: string,
    callback?: (err) => void
  ) => {
    if (client.value && isConnected.value) {
      client.value.publish(topic, message, err => {
        callback && callback(err);
        if (err) {
          console.error("Failed to publish message:", err);
        } else {
          console.log(`Published message to topic ${topic}: ${message}`);
        }
      });
    }
  };

  // 断开连接
  const disconnect = () => {
    if (client.value) {
      client.value.end();
      client.value = null;
    }
  };

  // // 生命周期钩子
  // onMounted(() => {
  //   // 在组件挂载时初始化 MQTT 客户端
  //   initMqtt("mqtt://test.mosquitto.org"); // 请替换为实际的 MQTT 服务器地址
  // });

  // onUnmounted(() => {
  //   // 在组件卸载时断开 MQTT 连接
  //   disconnect();
  // });

  return {
    isConnected,
    initMqtt,
    subscribeToTopic,
    publishMessage,
    disconnect
  };
}

export default useMqtt;
