import { body, param } from 'express-validator';
import NotFoundError from '../../errors/notFound.js';
import validatorMiddleware from '../../middleware/validatorMiddleware.js'
import ClassRoom from '../../models/ClassRoom.js';


export const addClassRoomValidator = [
  body('name').isObject().withMessage('name must be object two keys ar and en'),
  body('name.ar').notEmpty().withMessage('Arabic name required'),
  body('name.en').notEmpty().withMessage('English name required'),
  body('school').notEmpty().withMessage('school required')
    .custom(async (val) => {
      const classRoom = await ClassRoom.findById(val);
      if (!classRoom)
        throw new NotFoundError(`No classRoom for this id: ${val}`);
      return true;
    }),
  validatorMiddleware,
];

export const updateClassRoomValidator = [
  param('id')
    .custom(async (val) => {
      const classRoom = await ClassRoom.findById(val)
      if (!classRoom)
        throw new NotFoundError(`No classRoom for this id: ${val}`)
      return true;
    }),
  validatorMiddleware,
];