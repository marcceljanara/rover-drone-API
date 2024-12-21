import ClientError from '../../exceptions/ClientError.js';
// KODE INI BELUM DIBERI VALIDATION INPUT JOI

class AdminHandler {
  constructor({ adminsService, userService, validator }) {
    this._adminsService = adminsService;
    this._userService = userService;
    this._validator = validator;

    this.postRegisterUserByAdminHandler = this.postRegisterUserByAdminHandler.bind(this);
    this.getAllUserHandler = this.getAllUserHandler.bind(this);
    this.getDetailUserHandler = this.getDetailUserHandler.bind(this);
    this.deleteUserHandler = this.deleteUserHandler.bind(this);
    this.resetPasswordUserHandler = this.resetPasswordUserHandler.bind(this);
  }

  async postRegisterUserByAdminHandler(req, res, next) {
    try {
      this._validator.validateAdminPayload(req.body);

      const {
        username, password, fullname, email,
      } = req.body;
      await this._userService.checkExistingUser({ email, username });

      const userId = await this._adminsService.registerUser({
        username,
        password,
        fullname,
        email,
      });

      return res.status(201).json({
        status: 'success',
        message: 'User berhasil didaftarkan oleh admin',
        data: { userId },
      });
    } catch (error) {
      // Jika error adalah ClientError, kirim ke middleware error handler
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

  async getAllUserHandler(req, res, next) {
    try {
      // Mengambil parameter limit, offset, dan search dari query string
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const offset = (page - 1) * limit;
      const searchQuery = req.query.search || '';

      // Menyiapkan parameter pencarian
      const searchCondition = `%${searchQuery}%`;

      // Query untuk mengambil data obat
      const users = await this._adminsService.getAllUser(searchCondition, limit, offset);

      // Query untuk menghitung total data
      const totalCount = await this._adminsService.getCountData(searchCondition);

      // Menghitung total halaman
      const totalPages = Math.ceil(totalCount / limit);

      // Mengirim respon dengan data obat dan informasi halaman
      return res.status(200).json({
        status: 'success',
        message: 'Data user berhasil diperoleh',
        data: { users },
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      // Jika error adalah ClientError, kirim ke middleware error handler
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

  async getDetailUserHandler(req, res, next) {
    try {
      // Mengambil parameter ID dari URL
      const { id } = req.params;

      const user = await this._adminsService.getDetailUser(id);

      // Mengirim respon dengan data obat
      return res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      // Jika error adalah ClientError, kirim ke middleware error handler
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

  async deleteUserHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._adminsService.checkIsAdmin(id);
      await this._adminsService.deleteUser(id);
      return res.status(200).json({
        status: 'success',
        message: 'user berhasil dihapus',
      });
    } catch (error) {
      // Jika error adalah ClientError, kirim ke middleware error handler
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

  async resetPasswordUserHandler(){
    
  }
}

export default AdminHandler;
