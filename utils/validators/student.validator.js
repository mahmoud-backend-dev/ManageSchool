import { body, param } from 'express-validator';
import NotFoundError from '../../errors/notFound.js';
import validatorMiddleware from '../../middleware/validatorMiddleware.js'
import Student from '../../models/Student.js';
import ClassRoom from '../../models/ClassRoom.js';
import School from '../../models/School.js';

export const addClassRoomValidator = [
  body('name').isObject().withMessage('name must be object two keys ar and en'),
  body('name.ar').notEmpty().withMessage('Arabic name required'),
  body('name.en').notEmpty().withMessage('English name required'),
  body('classRoom').notEmpty().withMessage('school required')
      .custom(async (val) => {
      const classRoom = await ClassRoom.findById(val);
      if (!classRoom)
        throw new NotFoundError(`No classRoom for this id: ${val}`);
      return true;
      }),
  body('school').notEmpty().withMessage('school required')
    .custom(async (val) => { 
      const school = await School.findById(val);
      if (!school)
        throw new NotFoundError(`No school for this id: ${val}`);
      return true;
    }),
  validatorMiddleware,
];

export const updateClassRoomValidator = [
  param('id')
    .custom(async (val) => {
      const student = await Student.findById(val)
      if (!student)
        throw new NotFoundError(`No student for this id: ${val}`)
      return true;
    }),
  validatorMiddleware,
];

