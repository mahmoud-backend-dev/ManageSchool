import { Router } from "express";
import { allowTo } from "../controller/auth.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

import {
  addStudent,
  deleteStudent,
  getAllStudents,
  getSpecificStudent,
  updateStudent
} from "../controller/student.controller.js";
import {
  addStudentValidator,
  updateStudentValidator
} from "../utils/validators/student.validator.js";


const router = Router();

router.post('/add', protectRoute, allowTo('admin', 'manager'), addStudentValidator, addStudent);
router.patch('/update/:id', protectRoute, allowTo('admin', 'manager'), updateStudentValidator, updateStudent);
router.get('/one/:id', protectRoute, allowTo('admin', 'manager'), updateStudentValidator, getSpecificStudent);
router.get('/', protectRoute, allowTo('admin', 'manager'), getAllStudents);
router.delete('/delete/:id', protectRoute, allowTo('admin', 'manager'), updateStudentValidator, deleteStudent);

export default router;