
import { Router } from 'express';
import {
    createUser,
    getNewOtp,
    loginUser,
    refreshAccessToken,
    verifyUser
} from '../controllers/authController.js';
import validateRequestFields from '../middleware/validateRequestFields.js';

const routes = Router();

routes.post('/signup', validateRequestFields(['name', 'email', 'password']), createUser);
routes.post('/login', validateRequestFields(['email', 'password']), loginUser);
routes.post('/refresh-token', refreshAccessToken);
routes.post('/verify-otp', validateRequestFields(['email', 'otp']), verifyUser);
routes.post('/resend-otp', validateRequestFields(['email']), getNewOtp);


export default routes;
