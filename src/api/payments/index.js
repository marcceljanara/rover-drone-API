import PaymentsHandler from './handler.js';
import paymentRoutes from './routes.js';

const paymentsPlugin = ({
  app, paymentsService, rentalsService, validator,
}) => {
  const handler = new PaymentsHandler({
    paymentsService, rentalsService, validator,
  });
  app.use(paymentRoutes(handler));
};

export default paymentsPlugin;
