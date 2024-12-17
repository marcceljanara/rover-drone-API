import UserHandler from './handler.js';
import userRoutes from './routes.js';

const usersPlugin = ({
  app, userService, emailManager, validator,
}) => {
  const handler = new UserHandler({
    userService,
    emailManager,
    validator,
  });

  app.use('/users', userRoutes(handler));
};

export default usersPlugin;
