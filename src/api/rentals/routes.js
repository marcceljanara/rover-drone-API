import express from 'express';
// import verifyToken from '../../middleware/verifyToken.js';
// import verifyAdmin from '../../middleware/verifyAdmin.js';

const rentalRoutes = (handler) => {
  const router = express.Router();

  // Admin
  router.put('/rental/:id/status', handler.putStatusRentalHandler);
  router.delete('/rental/:id', handler.deleteRentalHandler);

  // User (same id)
  router.post('/rental', handler.postAddRentalHandler);
  router.get('/rental', handler.getAllRentalHandler);
  router.put('/rental/:id/cancel', handler.putCancelRentalHandler);
  router.get('/rental/:id', handler.getDetailRentalHandler);

  return router;
};

export default rentalRoutes;
