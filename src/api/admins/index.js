import AdminHandler from './handler.js';
import adminRoutes from './routes.js';

const adminsPlugin = ({
  app, adminsService, userService, validator,
}) => {
  const handler = new AdminHandler({
    adminsService, userService, validator,
  });
  app.use(adminRoutes(handler));
};

export default adminsPlugin;
