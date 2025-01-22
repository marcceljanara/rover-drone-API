class DevicesHandler {
  constructor({ devicesService, validator }) {
    this._devicesService = devicesService;
    this._validator = validator;

    // Admin
    this.postAddDeviceHandler = this.postAddDeviceHandler.bind(this);
    this.deleteDeviceHandler = this.deleteDeviceHandler.bind(this);
    this.putStatusDeviceHandler = this.putStatusDeviceHandler.bind(this);
    this.putMqttSensorHandler = this.putMqttSensorHandler.bind(this);
    this.putMqttControlHandler = this.putMqttControlHandler.bind(this);

    // User and admin
    this.getAllDeviceHandler = this.getAllDeviceHandler.bind(this);
    this.getDeviceHandler = this.getDeviceHandler.bind(this);
    this.putDeviceControlHandler = this.putDeviceControlHandler.bind(this);
    this.getSensorDataHandler = this.getSensorDataHandler.bind(this);
    this.getSensorDataLimitHandler = this.getSensorDataLimitHandler.bind(this);
    this.getSensorDataDownloadHandler = this.getSensorDataDownloadHandler.bind(this);
  }

  async postAddDeviceHandler(req, res) {
    const deviceId = await this._devicesService.addDevice();

    return res.status(201).json({
      status: 'success',
      message: 'device berhasil ditambahkan',
      data: { deviceId },
    });
  }

  async deleteDeviceHandler(req, res, next) {
    try {
      this._validator.validateParamsPayload(req.params);
      const { id } = req.params;
      await this._devicesService.deleteDevice(id);
      return res.status(200).json({
        status: 'success',
        message: 'device berhasil dihapus',
      });
    } catch (error) {
      return next(error);
    }
  }

  async putStatusDeviceHandler(req, res, next) {
    try {
      this._validator.validateParamsPayload(req.params);
      this._validator.validatePutStatusDevicePayload(req.body);
      const { id } = req.params;
      const { status } = req.body;
      await this._devicesService.changeStatusDevice(id, status);
      return res.status(200).json({
        status: 'success',
        message: 'status device berhasil diubah',
      });
    } catch (error) {
      return next(error);
    }
  }

  async putMqttSensorHandler(req, res, next) {
    try {
      this._validator.validateParamsPayload(req.params);
      const { id } = req.params;
      await this._devicesService.changeMqttSensor(id);
      return res.status(200).json({
        status: 'success',
        message: 'topic MQTT sensor berhasil diubah',
      });
    } catch (error) {
      return next(error);
    }
  }

  async putMqttControlHandler(req, res, next) {
    try {
      this._validator.validateParamsPayload(req.params);
      const { id } = req.params;
      await this._devicesService.changeMqttControl(id);
      return res.status(200).json({
        status: 'success',
        message: 'topic MQTT control berhasil diubah',
      });
    } catch (error) {
      return next(error);
    }
  }

  async getAllDeviceHandler(req, res) {
    const userId = req.id;
    const { role } = req;
    const devices = await this._devicesService.getAllDevice(userId, role);
    console.log(userId, role);
    return res.status(200).json({
      status: 'success',
      message: 'data device berhasil diperoleh',
      data: { devices },
    });
  }

  async getDeviceHandler(req, res, next) {
    try {
      const userId = req.id;
      const { role } = req;
      this._validator.validateParamsPayload(req.params);
      const { id } = req.params;

      const device = await this._devicesService.getDevice(userId, role, id);

      return res.status(200).json({
        status: 'success',
        data: { device },
      });
    } catch (error) {
      return next(error);
    }
  }

  async putDeviceControlHandler(req, res, next) {
    try {
      const userId = req.id;
      const { role } = req;
      this._validator.validateParamsPayload(req.params);
      this._validator.validatePutDeviceControlPayload(req.body);
      const { id } = req.params;
      const { command, action } = req.body;
      const response = await this._devicesService.deviceControl(userId, role, {
        id, command, action,
      });
      return res.status(200).json({
        status: 'success',
        message: `device ${response.status}`,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSensorDataHandler(req, res, next) {
    try {
      this._validator.validateParamsPayload(req.params);
      this._validator.validateQuerySensorPayload(req.query);
      const { id } = req.params;
      const userId = req.id;
      const { role } = req;
      const interval = req.query.interval || '1h';
      const sensors = await this._devicesService.getSensorData(userId, role, id, interval);
      return res.status(200).json({
        status: 'success',
        data: { sensors },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSensorDataLimitHandler(req, res, next) {
    try {
      this._validator.validateParamsPayload(req.params);
      this._validator.validateQueryLimitPayload(req.query);
      const { id } = req.params;
      const userId = req.id;
      const { role } = req;
      const limit = parseInt(req.query.limit, 10) || 10;
      const sensors = await this._devicesService.getSensorDataLimit(userId, role, id, limit);
      return res.status(200).json({
        status: 'success',
        data: { sensors },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSensorDataDownloadHandler(req, res) {
    try {
      this._validator.validateQuerySensorDownloadPayload(req.query);
      this._validator.validateParamsPayload(req.params);
      const { id } = req.params;
      const userId = req.id;
      const { role } = req;
      const interval = req.query.interval || '1h';
      // Memanggil service untuk mendapatkan data sensor dalam format CSV
      const csvData = await this._devicesService.getSensorDataDownload(userId, role, id, interval);

      // Menyusun header file CSV dan mengirimkan sebagai response
      res.setHeader('Content-Disposition', `attachment; filename="sensor_data_${id}_${interval}.csv"`);
      res.setHeader('Content-Type', 'text/csv');
      res.send(csvData); // Mengirim file CSV
    } catch (error) {
      console.error('Error in getSensorDataDownloadHandler:', error.message);
      res.status(500).json({ error: 'Failed to generate CSV for sensor data' });
    }
  }
}

export default DevicesHandler;
