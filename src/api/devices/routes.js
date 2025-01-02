import express from 'express';
import verifyToken from '../../middleware/verifyToken.js';
import verifyAdmin from '../../middleware/verifyAdmin.js';

const deviceRoutes = (handler) => {
  const router = express.Router();

  // Admin
  router.post('/admin/device', verifyToken, verifyAdmin, handler.postAddDeviceHandler);
  router.delete('/admin/device/:id', verifyToken, verifyAdmin, handler.deleteDeviceHandler);
  router.put('/admin/device/:id/status', verifyToken, verifyAdmin, handler.putStatusDeviceHandler);
  router.put('/admin/device/:id/mqttsensor', verifyToken, verifyAdmin, handler.putMqttSensorHandler);
  router.put('/admin/device/:id/mqttcontrol', verifyToken, verifyAdmin, handler.putMqttControlHandler);
  router.put('/admin/device/:id/rental', verifyToken, verifyAdmin, handler.putRentalIdHandler);
  router.put('/admin/device/:id/rental', verifyToken, verifyAdmin, handler.deleteRentalIdHandler);

  // User (same id) & admin (all device)
  // PERLU DIBERI MIDDLEWARE VERIFYDEVICE!!!
  router.get('/device', verifyToken, handler.getAllDeviceHandler);
  router.get('/device/:id', verifyToken, handler.getDeviceHandler);
  router.put('/device/:id/control', verifyToken, handler.putDeviceControlHandler);

  return router;
};

export default deviceRoutes;
