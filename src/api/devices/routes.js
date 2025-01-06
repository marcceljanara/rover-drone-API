import express from 'express';
import verifyToken from '../../middleware/verifyToken.js';
import verifyAdmin from '../../middleware/verifyAdmin.js';

const deviceRoutes = (handler) => {
  const router = express.Router();

  // Admin
  router.post('/device', verifyToken, verifyAdmin, handler.postAddDeviceHandler);
  router.delete('/device/:id', verifyToken, verifyAdmin, handler.deleteDeviceHandler);
  router.put('/device/:id/status', verifyToken, verifyAdmin, handler.putStatusDeviceHandler);
  router.put('/device/:id/mqttsensor', verifyToken, verifyAdmin, handler.putMqttSensorHandler);
  router.put('/device/:id/mqttcontrol', verifyToken, verifyAdmin, handler.putMqttControlHandler);
  // router.put('/device/:id/rental/add', verifyToken, verifyAdmin, handler.putRentalIdHandler);
  // eslint-disable-next-line max-len
  // router.put('/device/:id/rental/delete', verifyToken, verifyAdmin, handler.deleteRentalIdHandler);

  // User (same id) & admin (all device)
  // PERLU DIBERI MIDDLEWARE VERIFYDEVICE!!!
  router.get('/device', verifyToken, handler.getAllDeviceHandler);
  router.get('/device/:id', verifyToken, handler.getDeviceHandler);
  router.put('/device/:id/control', verifyToken, handler.putDeviceControlHandler);

  return router;
};

export default deviceRoutes;
