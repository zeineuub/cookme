const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema } = mongoose;

const ParameterSchema = new Schema({
  group: {
    type: String,
  },
  name: {
    type: String,
    unique: true,
  },
  value: {
    type: String,
  },
},
{
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

ParameterSchema.plugin(mongoosePaginate);
ParameterSchema.set('toJSON', { virtuals: true });
/**
* toJSON implementation
*/
ParameterSchema.options.toJSON = {
  transform(doc, ret) {
    const r = ret;
    r.id = r._id;
    delete r._id;
    delete r.__v;
    return r;
  },
};

module.exports = mongoose.model('Parameter', ParameterSchema);
