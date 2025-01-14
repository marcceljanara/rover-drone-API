import UserHandler from './handler.js';
import userRoutes from './routes.js';

const usersPlugin = ({
  app, userService, rabbitmqService, validator,
}) => {
  const handler = new UserHandler({
    userService,
    rabbitmqService,
    validator,
  });

  app.use('/users', userRoutes(handler));
};

export default usersPlugin;
