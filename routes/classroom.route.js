import { Router } from "express";
import { allowTo } from "../controller/auth.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

import {
  addClassRoom,
  getAllClassRooms,
  getSpecificClassRoom,
  deleteClassRoom,
  updateClassRoom
} from "../controller/classroom.controller.js";
import {
  addClassRoomValidator,
  updateClassRoomValidator
} from "../utils/validators/classroom.validator.js";


const router = Router();

router.post('/add', protectRoute, allowTo('admin', 'manager'), addClassRoomValidator, addClassRoom);
router.patch('/update/:id', protectRoute, allowTo('admin', 'manager'), updateClassRoomValidator, updateClassRoom);
router.get('/one/:id', protectRoute, allowTo('admin', 'manager'), updateClassRoomValidator, getSpecificClassRoom);
router.get('/', protectRoute, allowTo('user'), getAllClassRooms);
router.delete('/delete/:id', protectRoute, allowTo('admin', 'manager'), updateClassRoomValidator, deleteClassRoom);

export default router;