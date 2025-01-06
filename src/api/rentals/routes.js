import express from 'express';
import verifyToken from '../../middleware/verifyToken.js';
import verifyAdmin from '../../middleware/verifyAdmin.js';

const rentalRoutes = (handler) => {
  const router = express.Router();

  // Admin
  router.put('/rental/:id/status', verifyToken, verifyAdmin, handler.putStatusRentalHandler);
  router.delete('/rental/:id', verifyToken, verifyAdmin, handler.deleteRentalHandler);

  // User (same id)
  router.post('/rental', verifyToken, handler.postAddRentalHandler);
  router.get('/rental', verifyToken, handler.getAllRentalHandler);
  router.put('/rental/:id/cancel', verifyToken, handler.putCancelRentalHandler);
  router.get('/rental/:id', verifyToken, handler.getDetailRentalHandler);

  return router;
};

export default rentalRoutes;
