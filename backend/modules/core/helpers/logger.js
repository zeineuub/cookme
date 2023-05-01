const moment = require('moment');

const log = console;
const format = 'YYYY-MM-DD hh:mm:ss';

module.exports.types = {
  WARN: 0,
  ERROR: 1,
  LOG: 2,
};

module.exports.logger = (
  subject,
  message,
  method = '',
  type = this.types.WARN
) => {
  const types = ['warning', 'error', 'log'];

  const time = moment().format(format);
  let text = `${time} | ${subject} ${types[type]}: ${message}`;
  if (method.length > 0) {
    text += ` in method: ${method}`;
  }

  switch (type) {
    case this.types.WARN :
      log.warn(text);
      break;
    case this.types.ERROR :
      log.error(text);
      break;
    case this.types.LOG :
      log.log(text);
      break;
    default :
      log.log(text);
      break;
  }
};
