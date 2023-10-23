import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import { StatusCodes } from 'http-status-codes';
import { setPagination } from '../utils/pagination.js';
import ClassRoom from '../models/ClassRoom.js';
import School from '../models/School.js';

export const addStudent = asyncHandler(async (req, res) => {
  const student = await Student.create(req.body);
  await ClassRoom.findByIdAndUpdate(
    req.body.classRoom,
    { $addToSet: { students: student._id } },
  );
  res.status(StatusCodes.CREATED).json({
    status: "Success",
    student
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.OK).json({
    status: "Success",
    student
  });
});

export const getAllStudents = asyncHandler(async (req, res) => {
  const { limit, pagination, skip } = await setPagination(School, req);
  let lang = req.headers['accept-language'];
  if (!req.headers['accept-language'])
    lang = "en";

  const allStudents = await Student.find({}).populate({
    path: 'classRoom',
    select: `name.${lang}`
  }).populate({
    path: 'school',
    select: `name.${lang}`
  }).select(`name.${lang}`).limit(limit).skip(skip);
  res.status(StatusCodes.OK).json({
    status: "Success",
    count: allStudents.length,
    pagination,
    allStudents
  })
});

export const getSpecificSchool = asyncHandler(async (req, res) => {
  let lang = req.headers['accept-language'];
  if (!req.headers['accept-language'])
    lang = "en";

    const student = await Student.findById(req.params.id).populate({
      path: 'classRoom',
      select: `name.${lang}`
    }).populate({
      path: 'school',
      select: `name.${lang}`
    }).select(`name.${lang}`);
    return res.status(StatusCodes.OK).json({
      status: "Success",
      student
    })
})

export const deleteSchool = asyncHandler(async (req, res) => {
  await Student.findByIdAndRemove(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});