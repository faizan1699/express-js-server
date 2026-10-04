
import { Router } from 'express';
import {
    createUser,
    getNewOtp,
    verifyUser
} from '../controllers/authController.js';

const routes = Router();

routes.post('/signup', createUser);
routes.post('/verify-otp', verifyUser);
routes.post('/resend-otp', getNewOtp);

export default routes;
