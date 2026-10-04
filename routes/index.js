
import router from 'express';
import { createUser } from '../controllers/authController';

const routes = router();



routes.post("/register", createUser);


export default routes;

