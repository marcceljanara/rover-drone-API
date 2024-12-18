import AuthenticationHandler from './handler.js';
import authenticationRoutes from './routes.js';

const authenticationsPlugin = ({
  app, authenticationsService, userService, tokenManager, validator,
}) => {
  const handler = new AuthenticationHandler({
    authenticationsService,
    userService,
    tokenManager,
    validator,
  });

  app.use(authenticationRoutes(handler));
};

export default authenticationsPlugin;
