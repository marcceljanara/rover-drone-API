import express from 'express';
import verifyToken from '../../middleware/verifyToken.js';
import verifyAdmin from '../../middleware/verifyAdmin.js';

const deviceRoutes = (handler) => {
  const router = express.Router();

  // Admin
  router.post('/devices', verifyToken, verifyAdmin, handler.postAddDeviceHandler);
  router.delete('/devices/:id', verifyToken, verifyAdmin, handler.deleteDeviceHandler);
  router.put('/devices/:id/status', verifyToken, verifyAdmin, handler.putStatusDeviceHandler);
  router.put('/devices/:id/mqttsensor', verifyToken, verifyAdmin, handler.putMqttSensorHandler);
  router.put('/devices/:id/mqttcontrol', verifyToken, verifyAdmin, handler.putMqttControlHandler);
  // router.put('/device/:id/rental/add', verifyToken, verifyAdmin, handler.putRentalIdHandler);
  // eslint-disable-next-line max-len
  // router.put('/device/:id/rental/delete', verifyToken, verifyAdmin, handler.deleteRentalIdHandler);

  // User (same id) & admin (all device)
  // PERLU DIBERI MIDDLEWARE VERIFYDEVICE!!!
  router.get('/devices', verifyToken, handler.getAllDeviceHandler);
  router.get('/devices/:id', verifyToken, handler.getDeviceHandler);
  router.put('/devices/:id/control', verifyToken, handler.putDeviceControlHandler);

  return router;
};

export default deviceRoutes;
