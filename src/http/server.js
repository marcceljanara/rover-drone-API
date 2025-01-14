import express from 'express';
import dotenv from 'dotenv';
import '../services/cron/CleanExpiredRental.js';

// plugin
import usersPlugin from '../api/users/index.js';
import authenticationsPlugin from '../api/authentications/index.js';
import adminsPlugin from '../api/admins/index.js';
import rentalsPlugin from '../api/rentals/index.js';
import devicesPlugin from '../api/devices/index.js';
import paymentsPlugin from '../api/payments/index.js';

// service
import UserService from '../services/postgres/UserServices.js';
import AuthenticationsService from '../services/postgres/AuthenticationsService.js';
import AdminsService from '../services/postgres/AdminsService.js';
import RentalsService from '../services/postgres/RentalsService.js';
import DevicesService from '../services/postgres/DevicesService.js';
import PaymentsService from '../services/postgres/PaymentsService.js';
import ProducerService from '../services/rabbitmq/ProducerService.js';

// validator
import UsersValidator from '../validator/users/index.js';
import AuthenticationsValidator from '../validator/authentications/index.js';
import AdminsValidator from '../validator/admins/index.js';
import RentalsValidator from '../validator/rentals/index.js';
import DevicesValidator from '../validator/devices/index.js';
import PaymentsValidator from '../validator/payments/index.js';

// // utils
// import EmailManager from '../utils/EmailManager.js';

// token manager
import TokenManager from '../tokenize/TokenManager.js';

// Exceptions
import ClientError from '../exceptions/ClientError.js';
import ServerError from '../exceptions/ServerError.js';

dotenv.config();

function createServer() {
  const app = express();
  app.use(express.json());

  // Dependency Injection
  const userService = new UserService();
  const authenticationsService = new AuthenticationsService();
  const adminsService = new AdminsService();
  const rentalsService = new RentalsService();
  const devicesService = new DevicesService();
  const paymentsService = new PaymentsService();

  usersPlugin({
    app,
    userService,
    rabbitmqService: ProducerService,
    validator: UsersValidator,
  });

  authenticationsPlugin({
    app,
    authenticationsService,
    tokenManager: TokenManager,
    validator: AuthenticationsValidator,
  });

  adminsPlugin({
    app,
    adminsService,
    userService,
    validator: AdminsValidator,
  });

  rentalsPlugin({
    app,
    rentalsService,
    validator: RentalsValidator,
  });

  devicesPlugin({
    app,
    devicesService,
    validator: DevicesValidator,
  });

  paymentsPlugin({
    app,
    paymentsService,
    rentalsService,
    validator: PaymentsValidator,
  });

  // Global Error Handling Middleware
  // eslint-disable-next-line no-unused-vars
  app.get('/cause-error', (req, res) => {
    throw new ServerError('Unexpected error'); // Memicu error untuk pengujian
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // Jika error merupakan instance ClientError
    if (err instanceof ClientError) {
      return res.status(err.statusCode).json({
        status: 'fail',
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  });

  // Middleware jika rute tidak ditemukan (404)
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Rute tidak ditemukan',
    });
  });

  return app;
}

export default createServer;
