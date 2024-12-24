class UserHandler {
  constructor({ userService, emailManager, validator }) {
    this._userService = userService;
    this._emailManager = emailManager;
    this._validator = validator;

    this.postRegisterUserHandler = this.postRegisterUserHandler.bind(this);
    this.postVerifyOtpHandler = this.postVerifyOtpHandler.bind(this);
    this.postResendOtpHandler = this.postResendOtpHandler.bind(this);
  }

  async postRegisterUserHandler(req, res, next) {
    try {
      this._validator.validateUserPayload(req.body);

      const {
        username, password, fullname, email,
      } = req.body;
      await this._userService.checkExistingUser({ email, username });

      const userId = await this._userService.registerUser({
        username,
        password,
        fullname,
        email,
      });

      // Generate and send OTP
      const otp = await this._userService.generateOtp(email);
      await this._emailManager.sendOtpEmail(email, otp);

      return res.status(201).json({
        status: 'success',
        message: 'User berhasil didaftarkan. Silakan verifikasi email Anda.',
        data: { userId },
      });
    } catch (error) {
      return next(error);
    }
  }

  async postVerifyOtpHandler(req, res, next) {
    try {
      this._validator.validateOtpPayload(req.body);

      const { email, otp } = req.body;
      await this._userService.verifyOtp(email, otp);

      return res.status(200).json({
        status: 'success',
        message: 'Verifikasi berhasil. Akun Anda telah aktif.',
      });
    } catch (error) {
      return next(error);
    }
  }

  async postResendOtpHandler(req, res, next) {
    try {
      this._validator.validateResendOtpPayload(req.body);

      const { email } = req.body;
      const otp = await this._userService.generateOtp(email);
      await this._emailManager.sendOtpEmail(email, otp);

      return res.status(200).json({
        status: 'success',
        message: 'Kode OTP telah dikirim ulang ke email Anda.',
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default UserHandler;
