import RentalsHandler from './handler.js';
import rentalRoutes from './routes.js';

const rentalsPlugin = ({
  app, rentalsService, validator,
}) => {
  const handler = new RentalsHandler({
    rentalsService, validator,
  });
  app.use(rentalRoutes(handler));
};

export default rentalsPlugin;
