import { Schema, model } from "mongoose"; 

const classRoomSchema = new Schema({
  name: {
    ar: {
      type: String,
      required: [true, 'name required'],
    },
    en: {
      type: String,
      required: [true, 'name required'],
    },
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: "Student"
  }],
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'ClassRoom must belongs to school']
  },
}, { timestamps: true });


classRoomSchema.set('strictPopulate', false);

export default model('ClassRoom', classRoomSchema);