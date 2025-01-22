/* eslint-disable import/no-extraneous-dependencies */
import mqtt from 'mqtt';

/**
 * Membuat MQTT client
 * @param {Object} options - Konfigurasi MQTT
 * @param {string} options.url - URL broker MQTT
 * @param {string} options.username - Username untuk autentikasi MQTT
 * @param {string} options.password - Password untuk autentikasi MQTT
 * @param {string[]} topics - Daftar topik yang akan di-subscribe
 * @param {Function} onMessage - Callback untuk menangani pesan masuk
 * @returns {Object} MQTT client
 */
const createMqttClient = (options, topics, onMessage) => {
  const mqttClient = mqtt.connect(options.url, {
    username: options.username,
    password: options.password,
  });

  // Saat berhasil terhubung
  mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    topics.forEach((topic) => mqttClient.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Subscribed to topic: ${topic}`);
      } else {
        console.error(`Failed to subscribe to topic: ${topic}`, err.message);
      }
    }));
  });

  // Tangani pesan masuk
  mqttClient.on('message', (topic, message) => {
    if (onMessage) onMessage(topic, message);
  });

  // Tangani error
  mqttClient.on('error', (err) => {
    console.error('MQTT Error:', err.message);
  });

  return mqttClient;
};

export default createMqttClient;
