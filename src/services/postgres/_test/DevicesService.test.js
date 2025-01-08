import pkg from 'pg';
import dotenv from 'dotenv';
import DevicesService from '../DevicesService.js';
import NotFoundError from '../../../exceptions/NotFoundError.js';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool();

describe('DevicesService', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    // Membersihkan tabel `devices` setelah setiap test
    await pool.query('DELETE FROM devices');
  });

  describe('addDevice function', () => {
    it('should add device and return its ID', async () => {
      // Arrange
      const devicesService = new DevicesService();

      // Action
      const deviceId = await devicesService.addDevice();

      // Assert
      const query = {
        text: 'SELECT * FROM devices WHERE id = $1',
        values: [deviceId],
      };
      const result = await pool.query(query);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(deviceId);
    });
  });

  describe('deleteDevice function', () => {
    it('should delete device correctly', async () => {
      // Arrange
      const devicesService = new DevicesService();
      const deviceId = await devicesService.addDevice();

      // Action
      const deletedDevice = await devicesService.deleteDevice(deviceId);

      // Assert
      expect(deletedDevice.id).toBe(deviceId);
      const query = {
        text: 'SELECT * FROM devices WHERE id = $1 AND is_deleted = FALSE',
        values: [deviceId],
      };
      const result = await pool.query(query);
      expect(result.rows).toHaveLength(0);
    });

    it('should throw NotFoundError when device not found', async () => {
      // Arrange
      const devicesService = new DevicesService();

      // Action and Assert
      await expect(devicesService.deleteDevice('nonexistent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('changeStatusDevice function', () => {
    it('should change device status correctly', async () => {
      // Arrange
      const devicesService = new DevicesService();
      const deviceId = await devicesService.addDevice();

      // Action
      const updatedDevice = await devicesService.changeStatusDevice(deviceId, 'active');

      // Assert
      expect(updatedDevice.id).toBe(deviceId);
      const query = {
        text: 'SELECT status FROM devices WHERE id = $1',
        values: [deviceId],
      };
      const result = await pool.query(query);
      expect(result.rows[0].status).toBe('active');
    });

    it('should throw NotFoundError when device not found', async () => {
      // Arrange
      const devicesService = new DevicesService();
      

      // Action and Assert
      await expect(devicesService.changeStatusDevice('nonexistent-id', 'active')).rejects.toThrow(NotFoundError);
    });
  });

  describe('ChangeMqttSensor function', () => {
    it('should change MQTT topic sensor correctly', async () => {
      // Arrange
      const devicesService = new DevicesService();
      const deviceId = await devicesService.addDevice();

      // Action
      const updatedMqttSensor = await devicesService.changeMqttSensor(deviceId);

      // Assert
      expect(updatedMqttSensor.id).toBe(deviceId);
      const query = {
        text: 'SELECT sensor_topic FROM devices WHERE id = $1',
        values: [deviceId],
      };
      const result = await pool.query(query);
      expect(result.rows[0].sensor_topic).toBeDefined();
    });

    it('should throw NotFoundError when device not found', async () => {
      // Arrange
      const devicesService = new DevicesService();
      const deviceId = 'device-notfound';

      // Action and Assert
      await expect(devicesService.changeMqttSensor(deviceId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('ChangeMqttControl function', () => {
    it('should change MQTT topic control correctly', async () => {
      // Arrange
      const devicesService = new DevicesService();
      const deviceId = await devicesService.addDevice();

      // Action
      const updatedMqttSensor = await devicesService.changeMqttControl(deviceId);

      // Assert
      expect(updatedMqttSensor.id).toBe(deviceId);
      const query = {
        text: 'SELECT control_topic FROM devices WHERE id = $1',
        values: [deviceId],
      };
      const result = await pool.query(query);
      expect(result.rows[0].control_topic).toBeDefined();
    });

    it('should throw NotFoundError when device not found', async () => {
      // Arrange
      const devicesService = new DevicesService();
      const deviceId = 'device-notfound';

      // Action and Assert
      await expect(devicesService.changeMqttControl(deviceId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getDevice function', () => {
    it('should return device details correctly', async () => {
      // Arrange
      const devicesService = new DevicesService();
      const deviceId = await devicesService.addDevice();

      // Action
      const device = await devicesService.getDevice(deviceId);

      // Assert
      expect(device.id).toBe(deviceId);
    });

    it('should throw NotFoundError when device not found', async () => {
      // Arrange
      const devicesService = new DevicesService();

      // Action and Assert
      await expect(devicesService.getDevice('nonexistent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllDevice function', () => {
    it('should return all devices', async () => {
      // Arrange
      const devicesService = new DevicesService();
      await devicesService.addDevice();
      await devicesService.addDevice();

      // Action
      const devices = await devicesService.getAllDevice();

      // Assert
      expect(devices).toHaveLength(2);
    });
  });

  describe('deviceControl function', () => {
    it('should control device correctly', async () => {
      // Arrange
      const devicesService = new DevicesService();
      const deviceId = await devicesService.addDevice();

      // Action
      const device = await devicesService.deviceControl({ id: deviceId, action: 'on' });

      // Assert
      expect(device.status).toBe('active');
      expect(device.id).toBe(deviceId);
    });

    it('should throw not found error when device not exist', async () => {
      // Arrange
      const devicesService = new DevicesService();
      const deviceId = 'device-notexist';

      // Action and Asser
      await expect(devicesService.deviceControl({ id: deviceId, action: 'on' })).rejects.toThrow(NotFoundError);
    });
  });
});
