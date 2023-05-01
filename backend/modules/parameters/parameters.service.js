const db = require('../core/helpers/db');
const { logger } = require('../core/helpers/logger');
const i18n = require('../core/services/i18n');
const NotFoundError = require('../core/errors/NotFoundError');

const { Parameter } = db;

module.exports.create = async (data) => {
  const parameter = new Parameter(data);
  await parameter.save();
  return parameter;
};

module.exports.getParameters = async () => {
  const parameters = await Parameter.find({})
    .sort('group');
  return parameters;
};

module.exports.updateParameter = async (id, { value }) => {
  const parameter = await Parameter.findById(id);
  if (!parameter) throw new NotFoundError('parameter not found');
  Object.assign(parameter, {
    value,
  });
  process.env[parameter.name] = parameter.value;
  await parameter.save();
  return parameter;
};

module.exports.updateMany = async (data) => {
  for (let i = 0; i < data.length; i += 1) {
    const param = data[i];
    this.updateParameter(param.id, { value: param.value });
  }
};

module.exports.loadParams = async () => {
  const parameters = await Parameter.find({});
  for (let i = 0; i < parameters.length; i += 1) {
    const parameter = parameters[i];
    process.env[parameter.name] = parameter.value;
  }
};
