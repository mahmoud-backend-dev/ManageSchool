import { Router } from "express";
import { allowTo } from "../controller/auth.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

import {
  addSchool,
  getAllSchools,
  getSpecificSchool,
  deleteSchool,
  updateSchool
} from "../controller/school.controller.js";
import {
  addSchoolValidator,
  updateSchoolValidator
} from "../utils/validators/school.validator.js";


const router = Router(); 

router.post('/add', protectRoute, allowTo('admin', 'manager'), addSchoolValidator, addSchool);
router.patch('/update/:id', protectRoute, allowTo('admin', 'manager'), updateSchoolValidator, updateSchool);
router.get('/one/:id', protectRoute, allowTo('admin', 'manager'), updateSchoolValidator, getSpecificSchool);
router.get('/', protectRoute, allowTo('user'), getAllSchools);
router.delete('/delete/:id', protectRoute, allowTo('admin', 'manager'), updateSchoolValidator, deleteSchool);

export default router;