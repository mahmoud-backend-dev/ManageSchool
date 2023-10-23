import { Schema, model } from "mongoose";

const studentSchema = new Schema({
  name: {
    ar: {
      type: String,
      required: [true, 'name required'],
    },
    en: {
      type: String,
      required: [true, 'name required'],
    }
  },
  classRoom: {
    type: Schema.Types.ObjectId,
    ref: "ClassRoom",
    required:true,
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required:true
  }
}, { timestamps: true });

studentSchema.set('strictPopulate', false);

export default model('Student', studentSchema);