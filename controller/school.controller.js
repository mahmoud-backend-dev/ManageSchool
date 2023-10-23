import asyncHandler from 'express-async-handler';
import School from '../models/School.js';
import { StatusCodes } from 'http-status-codes';
import { setPagination } from '../utils/pagination.js';

export const addSchool = asyncHandler(async (req, res) => {
  const school = await School.create(req.body);
  res.status(StatusCodes.CREATED).json({
    status: "Success",
    school
  });
});

export const updateSchool = asyncHandler(async (req, res) => {
  const school = await School.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.OK).json({
    status: "Success",
    school
  });
});

export const getAllSchools = asyncHandler(async (req, res) => {
  const { limit, pagination, skip } = await setPagination(School, req);
  let lang = req.headers['accept-language'];
  if (!req.headers['accept-language'])
    lang = "en";
  const allSchool = await School.find({}).populate({
    path: 'classRooms',
    select: `name.${lang} students`
  }).populate({
    path: 'classRooms.students',
    select: `name.${lang}`
  }).select(`name.${lang}`).limit(limit).skip(skip);
  res.status(StatusCodes.OK).json({
    status: "Success",
    count: allSchool.length,
    pagination,
    allSchool
  })
});

export const getSpecificSchool = asyncHandler(async (req, res) => {
  let lang = req.headers['accept-language'];
  if (!req.headers['accept-language'])
    lang = "en";

    const school = await School.findById(req.params.id).populate({
      path: 'classRooms',
      select: `name.${lang} students`
    }).populate({
      path: 'classRooms.students',
      select: `name.${lang}`
    }).select(`name.${lang}`);
    return res.status(StatusCodes.OK).json({
      status: "Success",
      school
    });
})

export const deleteSchool = asyncHandler(async (req, res) => {
  await School.findByIdAndRemove(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});