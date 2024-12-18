import AuthenticationHandler from './handler';
import authenticationRoutes from './routes';

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
