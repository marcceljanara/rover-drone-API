import ClientError from '../../exceptions/ClientError.js';

class AuthenticationHandler {
  constructor({
    authenticationsService, userService, tokenManager, validator,
  }) {
    this._authenticationsService = authenticationsService;
    this._userService = userService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(req, res, next) {
    try {
      this._validator.validatePostAuthenticationPayload(req.body);
      const { email, password } = req.body;
      await this._userService.checkStatusAccount(email);
      const { id, role } = await this._userService.verifyUserCredential(email, password);
      const accessToken = this._tokenManager.generateAccessToken({ id, role });
      const refreshToken = this._tokenManager.generateRefreshToken({ id, role });
      await this._authenticationsService.addRefreshToken(refreshToken);
      return res.status(201).json({
        status: 'success',
        message: 'Authentication berhasil ditambahkan',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      // console.log(error);
      if (error instanceof ClientError) {
        return next(error);
      }

      return res.status(500).json({
        status: 'fail',
        message: 'Terjadi kesalahan pada server.',
      });
    }
  }

  async putAuthenticationHandler(req, res, next) {
    try {
      this._validator.validatePutAuthenticationPayload(req.body);
      const { refreshToken } = req.body;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      const { id, role } = this._tokenManager.verifyRefreshToken(refreshToken);
      const accessToken = this._tokenManager.generateAccessToken({ id, role });

      return res.status(200).json({
        status: 'success',
        message: 'Access Token berhasil diperbarui',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      // console.log(error);
      if (error instanceof ClientError) {
        return next(error);
      }

      // Jika error bukan ClientError, beri respons error server
      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan pada server.',
      });
    }
  }

  async deleteAuthenticationHandler(req, res, next) {
    try {
      this._validator.validateDeleteAuthenticationPayload(req.body);
      const { refreshToken } = req.body;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return res.status(200).json({
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      });
    } catch (error) {
      // console.log(error);
      if (error instanceof ClientError) {
        return next(error);
      }

      // Jika error bukan ClientError, beri respons error server
      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan pada server.',
      });
    }
  }
}

export default AuthenticationHandler;
