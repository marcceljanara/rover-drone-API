import AuthenticationHandler from './handler.js';
import authenticationRoutes from './routes.js';

const authenticationsPlugin = ({
  app, authenticationsService, tokenManager, validator,
}) => {
  const handler = new AuthenticationHandler({
    authenticationsService,
    tokenManager,
    validator,
  });

  app.use(authenticationRoutes(handler));
};

export default authenticationsPlugin;
