import authRoute from './auth.route.js';
import schoolRoute from './school.route.js';
import classRoom from './classroom.route.js';
import student from './student.route.js';

export default (app) => {
  app.use('/auth', authRoute);
  app.use('/school', schoolRoute);
  app.use('/classroom', classRoom);
  app.use('/student', student);
};