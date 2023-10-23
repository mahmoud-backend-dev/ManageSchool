import authRoute from './authRoute.js';
import schoolRoute from './schoolRoute.js';

export default (app) => {
  app.use('/auth', authRoute);
  app.use('/school', schoolRoute);
};