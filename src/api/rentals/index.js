import RentalsHandler from './handler.js';
import rentalRoutes from './routes.js';

const rentalsPlugin = ({
  app, rentalsService, rabbitmqService, validator,
}) => {
  const handler = new RentalsHandler({
    rentalsService, rabbitmqService, validator,
  });
  app.use(rentalRoutes(handler));
};

export default rentalsPlugin;
