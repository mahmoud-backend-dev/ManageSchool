import { Schema, model } from "mongoose";

const schoolSchema = new Schema({
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
  classRooms: [{
    type: Schema.Types.ObjectId,
    ref: 'ClassRoom',
  }],
}, { timestamps: true });

schoolSchema.pre(/^find/, function (next) {
  this.select("-__v -createdAt -updatedAt");
  next()
});

schoolSchema.set('strictPopulate', false);

export default model('School', schoolSchema);