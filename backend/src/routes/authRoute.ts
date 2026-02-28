import { Router } from 'express';
import { register, allUsers , login} from '../controllers/authController.ts';

const router = Router();

router.post('/register', register);
router.get('/users', allUsers);
router.post('/login', login);
 
export default router;