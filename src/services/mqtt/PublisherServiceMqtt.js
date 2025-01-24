import dotenv from 'dotenv';
import MqttClient from '../../config/mqtt/mqttClient.js';

dotenv.config();

const PublisherService = {
  publishMessage: async (topic, message) => {
    const mqttOptions = {
      url: process.env.MQTT_URL,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    };

    // Inisialisasi instance MqttClient
    const mqttService = new MqttClient(mqttOptions);

    try {
      // Publikasi pesan ke topik
      mqttService.publish(topic, message);

      console.log(`Message published to topic "${topic}":`, message);
    } catch (err) {
      console.error('Error while publishing message:', err.message);
    }
  },

};
export default PublisherService;
