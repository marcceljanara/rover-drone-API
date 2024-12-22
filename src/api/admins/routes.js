import express from 'express';
import verifyAdmin from '../../middleware/verifyAdmin.js';
import verifyToken from '../../middleware/verifyToken.js';

const adminRoutes = (handler) => {
  const router = express.Router();

  router.post('/admin/management', verifyToken, verifyAdmin, handler.postRegisterUserByAdminHandler);
  router.get('/admin/management', verifyToken, verifyAdmin, handler.getAllUserHandler);
  router.get('/admin/management/:id', verifyToken, verifyAdmin, handler.getDetailUserHandler);
  router.delete('/admin/management/:id', verifyToken, verifyAdmin, handler.deleteUserHandler);
  router.put('/admin/management/:id', verifyToken, verifyAdmin, handler.putPasswordUserHandler);

  return router;
};

export default adminRoutes;
