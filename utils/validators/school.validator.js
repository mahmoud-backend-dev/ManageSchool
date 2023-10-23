import { body, param } from 'express-validator';
import NotFoundError from '../../errors/notFound.js';
import validatorMiddleware from '../../middleware/validatorMiddleware.js'
import School from '../../models/School.js';


export const addSchoolValidator = [
  body('name').isObject().withMessage('name must be object two keys ar and en'),
  body('name.ar').notEmpty().withMessage('Arabic name required'),
  body('name.en').notEmpty().withMessage('English name required'),
  validatorMiddleware,
];

export const updateSchoolValidator = [
  param('id')
    .custom(async (val) => {
      const school = await School.findById(val)
      if (!school)
        throw new NotFoundError(`No school for this id: ${val}`)
      return true;
    }),
  validatorMiddleware,
];



