import express from 'express';

const userRoutes = (handler) => {
  const router = express.Router();

  router.post('/register', handler.postRegisterUserHandler);
  router.post('/verify-otp', handler.postVerifyOtpHandler);
  router.post('/resend-otp', handler.postResendOtpHandler);

  return router;
};

export default userRoutes;
