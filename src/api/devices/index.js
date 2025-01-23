import DevicesHandler from './handler.js';
import deviceRoutes from './routes.js';

const devicesPlugin = ({
  app, devicesService, mqttPublisher, validator,
}) => {
  const handler = new DevicesHandler({
    devicesService, mqttPublisher, validator,
  });
  app.use(deviceRoutes(handler));
};

export default devicesPlugin;
