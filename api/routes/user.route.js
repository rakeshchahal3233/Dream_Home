import express from 'express'
import { updateUser ,deleteUser,getUserListing,getUser } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/update/:id',verifyToken,updateUser);
router.delete('/delete/:id',verifyToken,deleteUser);
router.get('/listings/:id',verifyToken,getUserListing);
router.get('/:id',verifyToken,getUser)

export default router;