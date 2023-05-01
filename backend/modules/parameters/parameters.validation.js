module.exports.nameSchema = {
  name: {
    custom: {
      options: (value, { req }) => {
        if (!req.body.name) {
          throw new Error('parameter name must be given');
        }

        if (typeof req.body.name !== 'string') {
          throw new Error('parameter name must be a string');
        }

        if (req.body.name === '') {
          throw new Error('parameter name must not be an empty string');
        }

        return value;
      },
    },
  },
};
