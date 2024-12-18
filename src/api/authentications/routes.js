import express from 'express';

const authenticationRoutes = (handler) => {
  const router = express.Router();

  router.post('/authentications', handler.postAuthenticationHandler);
  router.put('/authentications', handler.putAuthenticationHandler);
  router.delete('/authentications', handler.deleteAuthenticationHandler);

  return router;
};

export default authenticationRoutes;
