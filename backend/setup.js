const mongoose = require('mongoose');
const express = require ('express');
const cors = require('cors');
const bodyParser = require('body-parser');
//create our app
const app = express();
//create our server
const http = require('http').createServer(app);
const errorHandler = require('./modules/core/middlewares/errors');
const i18n = require('./modules/core/services/i18n');
const parametersService = require('./modules/parameters/parameters.service');

async function dbConn() {
    // db connection
    mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }, err => {
      if (err) throw err;
      console.log('Connected to MongoDB')
   });
  
    mongoose.Promise = global.Promise;
    // load params
   await parametersService.loadParams();
}
module.exports.setup = async () => {
    await dbConn();
  
    app.use(i18n.init); 
    //support parsing of application/x-www-form-urlencoded post data
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    // support parsing of application/json type post data
    app.use(bodyParser.json({limit: '50mb'}));
    // enable CORS - Cross Origin Resource Sharing
    app.use(cors());

    //routes
    /* eslint-disable global-require */
    app.use('/api/v1/user',require('./modules/user/user.controller'));
    app.use('/api/v1/auth', require('./modules/user/auth.controller'));
    app.use('/api/v1/parameters', require('./modules/parameters/parameters.controller'));
    app.use('/api/v1/recipes', require('./modules/recipes/recipes.controller'));


    // error handler
    app.use(errorHandler);


    // start server
    http.listen(process.env.PORT || 3000);
};