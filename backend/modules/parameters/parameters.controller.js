const express = require('express');
const { checkSchema } = require('express-validator');
const { nameSchema } = require('./parameters.validation');
const checkSchemaErrors = require('../core/middlewares/schema-erros');


const router = express.Router();

const { authorize } = require('../core/middlewares/authorize');
const parametersService = require('./parameters.service');

/**
* Create a parameter
* @param req
* @param res
* @param next
* @returns {data}
*/

function createParameter(req, res, next) {
  parametersService.create(req.body)
    .then(parameter => (parameter ? res.json({ data: parameter }) : res.sendStatus(204)))
    .catch(err => next(err));
}

/**
* Get parameters
* @param req
* @param res
* @param next
* @returns {data}
*/

function getParameters(req, res, next) {
  parametersService.getParameters()
    .then(parameters => (parameters ? res.json({ data: parameters }) : res.sendStatus(204)))
    .catch(err => next(err));
}

/**
* update parameter
* @param req
* @param res
* @param next
* @returns {data}
*/

function updateParameter(req, res, next) {
  parametersService.updateParameter(req.params.id, req.body)
    .then(parameter => (parameter ? res.json(parameter) : res.sendStatus(204)))
    .catch(err => next(err));
}

/**
* update many parameters
* @param req
* @param res
* @param next
* @returns {data}
*/

function updateMany(req, res, next) {
  const parameters = req.body.parameters || [];
  parametersService.updateMany(parameters)
    .then(res.sendStatus(204))
    .catch(err => next(err));
}

/**
* load parameters updates
* @param req
* @param res
* @param next
* @returns {data}
*/

function loadParams(req, res, next) {
  parametersService.loadParams()
    .then(res.status(204).send('parameters updated loaded successfully'))
    .catch(err => next(err));
}

module.exports = router;

/**
* POST /api/v1/parameters/create
* Create a new parameters
*/

router.post(
  '/create',
  authorize(['admin']),
  checkSchema(nameSchema),
  checkSchemaErrors,
  createParameter,
);

/**
* GET /api/v1/parameters/
* Get parameters
*/

router.get(
  '/',
  authorize(['admin']),
  getParameters,
);

/**
* PUT /api/v1/parameters/:id/update
* update parameters
*/

router.put(
  '/:id/update',
  authorize(['admin']),
  updateParameter,
);

/**
* PUT /api/v1/parameters/update
* update parameters
*/

router.put(
  '/update',
  authorize(['admin']),
  updateMany,
);

/**
* POST /api/v1/parameters/load
* load parameters
*/

router.post(
  '/load',
  authorize(['admin']),
  loadParams,
);
