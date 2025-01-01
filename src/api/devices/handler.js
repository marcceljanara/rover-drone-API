class DevicesHandler {
  constructor({ devicesService, validator }) {
    this._devicesService = devicesService;
    this._validator = validator;

    // BELUM ADA VALIDATOR
    // Admin
    this.postAddDeviceHandler = this.postAddDeviceHandler.bind(this);
    this.deleteDeviceHandler = this.deleteDeviceHandler.bind(this);
    this.putStatusDeviceHandler = this.putStatusDeviceHandler.bind(this);
    this.putMqttSensorHandler = this.putMqttSensorHandler.bind(this);
    this.putMqttControlHandler = this.putMqttControlHandler.bind(this);
    this.putRentalIdHandler = this.putRentalIdHandler.bind(this);
    this.deleteRentalIdHandler = this.deleteRentalIdHandler.bind(this);

    // User and admin
    this.getAllDeviceHandler = this.getAllDeviceHandler.bind(this);
    this.getDeviceHandler = this.getDeviceHandler.bind(this);
    this.putDeviceControlHandler = this.putDeviceControlHandler.bind(this);
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

  async putRentalIdHandler(req, res, next) {
    try {
      this._validator.validateParamsPayload(req.params);
      this._validator.validatePutRentalIdPayload(req.body);
      const { id } = req.params;
      const { rental_id } = req.body;
      await this._devicesService.addRentalId(id, rental_id);
      return res.status(200).json({
        status: 'success',
        message: 'rental_id berhasil diubah',
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async deleteRentalIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._devicesService.deleteRentalId(id);
      return res.status(200).json({
        status: 'success',
        message: 'rental_id berhasil dihapus',
      });
    } catch (error) {
      return next(error);
    }
  }

  async getAllDeviceHandler(req, res) {
    const devices = await this._devicesService.getAllDevice();
    return res.status(200).json({
      status: 'success',
      message: 'data device berhasil diperoleh',
      data: { devices },
    });
  }

  async getDeviceHandler(req, res, next) {
    try {
      this._validator.validateParamsPayload(req.params);
      const { id } = req.params;

      const device = await this._devicesService.getDevice(id);

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
      this._validator.validateParamsPayload(req.params);
      this._validator.validatePutDeviceControlPayload(req.body);
      const { id } = req.params;
      const { command, action } = req.body;
      const response = await this._devicesService.deviceControl({
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
}

export default DevicesHandler;
