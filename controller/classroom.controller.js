import asyncHandler from 'express-async-handler';
import ClassRoom from '../models/ClassRoom.js';
import { StatusCodes } from 'http-status-codes';
import { setPagination } from '../utils/pagination.js';
import School from '../models/School.js';

export const addClassRoom = asyncHandler(async (req, res) => {
  const classRoom = await ClassRoom.create(req.body);
  await School.findByIdAndUpdate(
    req.body.school,
    { $addToSet: { classRooms: classRoom._id } },
  );
  res.status(StatusCodes.CREATED).json({
    status: "Success",
    classRoom
  });
});

export const updateClassRoom = asyncHandler(async (req, res) => {
  const classRoom = await ClassRoom.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.OK).json({
    status: "Success",
    classRoom
  });
});

export const getAllClassRooms = asyncHandler(async (req, res) => {
  let lang = req.headers['accept-language'];
  if (!req.headers['accept-language'])
    lang = "en";

  const { limit, pagination, skip } = await setPagination(School, req);

  const allClassRooms = await ClassRoom.find({}).populate({
    path: 'students',
    select: 'name.en'
  }).populate({
    path: 'school',
    select: `name.${lang}`
  }).select(`name.${lang}`).limit(limit).skip(skip);
  res.status(StatusCodes.OK).json({
    status: "Success",
    count: allClassRooms.length,
    pagination,
    allClassRooms
  })

});

export const getSpecificClassRoom = asyncHandler(async (req, res) => {
  let lang = req.headers['accept-language'];
  if (!req.headers['accept-language'])
    lang = "en";

  const classRoom = await ClassRoom.findById(req.params.id).populate({
    path: 'students',
    select: `name.${lang}`
  }).populate({
    path: 'school',
    select: `name.${lang}`
  }).select(`name.${lang}`);
  return res.status(StatusCodes.OK).json({
    status: "Success",
    classRoom
  })
})

export const deleteSchool = asyncHandler(async (req, res) => {
  await ClassRoom.findByIdAndRemove(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});