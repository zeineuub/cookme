const i18n = require('../core/services/i18n');

module.exports.createRecipe = {
  title: {
    exists: {
      errorMessage: i18n.__('recipe.validation.required_title'),
    },
  },
  ingredients: {
    exists: {
      errorMessage: i18n.__('recipe.validation.required_ingredients'),
    },
  },
  instructions: {
    exists: {
      errorMessage: i18n.__('recipe.validation.required_instructions'),
    },
  },
  equipments: {
    exists: {
      errorMessage: i18n.__('recipe.validation.required_equipments'),
    },
  },
}
module.exports.searchRecipe = {
  ingredients: {
    exists: {
      errorMessage: i18n.__('recipe.validation.required_ingredients'),
    },
  },
   
}
module.exports.favoriteRecipe = {
  favorite: {
      exists: {
        errorMessage: i18n.__('recipe.validation.required_ingredients'),
      },
  },
   
}