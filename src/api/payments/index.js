import PaymentsHandler from './handler.js';
import paymentRoutes from './routes.js';

const paymentsPlugin = ({
  app, paymentsService, rentalsService, rabbitmqService, validator,
}) => {
  const handler = new PaymentsHandler({
    paymentsService, rentalsService, rabbitmqService, validator,
  });
  app.use(paymentRoutes(handler));
};

export default paymentsPlugin;
