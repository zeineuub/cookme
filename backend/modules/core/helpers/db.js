const UserModel = require('../../user/user.model');
const ParametersModel  = require('../../parameters/parameters.model');
const RecipeModel= require('../../recipes/recipes.model');
module.exports = {
    User: UserModel,
    Parameter: ParametersModel,
    Recipe: RecipeModel
};