import express from 'express';
import verifyToken from '../../middleware/verifyToken.js';
import verifyAdmin from '../../middleware/verifyAdmin.js';

const rentalRoutes = (handler) => {
  const router = express.Router();

  // Admin
  router.put('/rentals/:id/status', verifyToken, verifyAdmin, handler.putStatusRentalHandler);
  router.delete('/rentals/:id', verifyToken, verifyAdmin, handler.deleteRentalHandler);

  // User (same id)
  router.post('/rentals', verifyToken, handler.postAddRentalHandler);
  router.get('/rentals', verifyToken, handler.getAllRentalHandler);
  router.put('/rentals/:id/cancel', verifyToken, handler.putCancelRentalHandler);
  router.get('/rentals/:id', verifyToken, handler.getDetailRentalHandler);

  return router;
};

export default rentalRoutes;
