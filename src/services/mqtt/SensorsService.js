import pkg from 'pg';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';
import MqttClient from '../../config/mqtt/mqttClient.js';

// Load environment variables
dotenv.config();

// Konfigurasi database dengan Pool
const { Pool } = pkg;
const dbPool = new Pool();

// Variabel global untuk menyimpan daftar topik yang disubscribe
let currentTopics = [];

// Fungsi untuk memuat topik dari tabel devices
const loadTopics = async () => {
  const client = await dbPool.connect();
  try {
    const result = await client.query('SELECT sensor_topic FROM devices');
    return result.rows.map((row) => row.sensor_topic);
  } finally {
    client.release(); // Mengembalikan koneksi ke pool
  }
};

// Fungsi untuk menyimpan data sensor ke tabel sensordata
const saveSensorData = async (deviceId, data) => {
  const {
    timestamp, temperature, humidity, light_intensity,
  } = data;
  const client = await dbPool.connect();
  try {
    const query = `
      INSERT INTO sensordata (id, device_id, timestamp, temperature, humidity, light_intensity)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
      `${nanoid(16)}`,
      deviceId,
      new Date(timestamp),
      temperature || null,
      humidity || null,
      light_intensity || null,
    ];
    await client.query(query, values);
  } finally {
    client.release(); // Mengembalikan koneksi ke pool
  }
};

// Konfigurasi MQTT client
(async () => {
  const mqttOptions = {
    url: process.env.MQTT_URL,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  };

  // Buat instance MqttClient
  const mqttService = new MqttClient(mqttOptions);

  // Callback untuk menangani pesan masuk
  const handleIncomingMessage = async (topic, message) => {
    try {
      const payload = JSON.parse(message);
      const deviceId = topic.split('/')[1]; // Parsing device_id dari topik

      // Simpan data sensor
      await saveSensorData(deviceId, payload);
      console.log(`Data saved for device: ${deviceId}`);
    } catch (err) {
      console.error('Error processing message:', err.message);
    }
  };

  // Load awal daftar topik dan subscribe
  currentTopics = await loadTopics();
  mqttService.subscribe(currentTopics, handleIncomingMessage);

  // Fungsi untuk menyegarkan topik
  const refreshTopics = async () => {
    try {
      const newTopics = await loadTopics();
      const topicsToSubscribe = newTopics.filter((topic) => !currentTopics.includes(topic));

      if (topicsToSubscribe.length > 0) {
        mqttService.subscribe(topicsToSubscribe, handleIncomingMessage);
        console.log(`Subscribed to new topics: ${topicsToSubscribe.join(', ')}`);
        currentTopics = newTopics; // Update daftar topik yang sudah disubscribe
      }
    } catch (err) {
      console.error('Error refreshing topics:', err.message);
    }
  };

  // Jalankan refreshTopics setiap 10 detik
  setInterval(refreshTopics, 10000);

  // Tangani penutupan aplikasi
  process.on('SIGINT', async () => {
    console.log('Disconnecting...');
    mqttService.disconnect(); // Menutup koneksi MQTT
    await dbPool.end(); // Menutup pool
    process.exit(0);
  });
})();
