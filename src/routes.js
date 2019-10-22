import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import AnswerController from './app/controllers/AnswerController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);
routes.post('/students', StudentController.store);
routes.put('/students', StudentController.update);
routes.get('/plans', PlanController.list);
routes.get('/plans/:id', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);
routes.get('/enrollments', EnrollmentController.list);
routes.get('/enrollments/:id', EnrollmentController.index);
routes.post('/enrollments', EnrollmentController.store);
routes.put('/enrollments/:id', EnrollmentController.update);
routes.delete('/enrollments/:id', EnrollmentController.delete);
routes.post('/students/:student_id/checking', CheckinController.store);
routes.get('/students/:student_id/checking', CheckinController.index);
routes.post('/students/:student_id/help-orders', HelpOrderController.store);
routes.get('/students/:student_id/help-orders', HelpOrderController.index);
routes.get('/help-orders', AnswerController.list);
routes.post('/help-orders/:id/answer', AnswerController.store);

export default routes;
