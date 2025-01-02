import DevicesHandler from './handler.js';
import deviceRoutes from './routes.js';

const devicesPlugin = ({
  app, devicesService, validator,
}) => {
  const handler = new DevicesHandler({
    devicesService, validator,
  });
  app.use(deviceRoutes(handler));
};

export default devicesPlugin;
