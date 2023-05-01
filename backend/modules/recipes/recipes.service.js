const db = require('../core/helpers/db');
const {logger} = require('../core/helpers/logger');
const i18n = require('../core/services/i18n');
const UnprocessableEntityError = require('../core/errors/UnprocessableEntityError');
const userService = require('../user/user.service');
const BadRequestError = require('../core/errors/BadrequestError');
const axios = require('axios');
const { User, Recipe} = db;

/**
 * Create a recipe
 * @param data
 * @returns {User}
 */
module.exports.createOne = async(data) => {
    const recipeExist = await Recipe.findOne({title:data.tile});
    if( recipeExist) {
        logger('Recipe', `Recipe "${data.title}" already exists`, 'createRecipe');
        throw new BadRequestError('createRecipe')
    }
    const equipmentList = Object.entries(data.equipements).map(([key, value]) => ({
        name: value,
      }));
    const recipe = new Recipe();
    Object.assign(recipe, {
        title: data.title.toLowerCase(),
        image:data.image,
        servings:data.servings,
        readyInMinutes:data.readyInMinutes,
        instructions:data.tiinstructionstle,
        ingredients:data.ingredients,
        equipments:equipmentList,
        missing_ingredients:data.missing_ingredients,
        sourceUrl:data.sourceUrl,
        recipeId:data.recipeId,
    });
    await recipe.save();
    return recipe;
}

/**
 * Get recipe by id
 * @param id
 * @returns {Recipe}
 */
module.exports.getOne = async(id) => {
    const recipe = await Recipe.findById(id);
    if( !recipe) {
        logger('Recipe', `Recipe with title #${data.title} not found`, 'getOne');
        throw new BadRequestError('getOne');
    }
   
    return recipe
}
/**
 * Save recipe for user
 * @param userId
 * @param recipeId
 * @returns {User}
 */
module.exports.saveRecipe = async(userId, data) => {
    
    const user = await User.findById(userId)
    .populate({
        path:'myRecipes',
        select:['title', 'ingredients', 'instructions', 'image', 'servings', 'readyInMinutes','equipments','favorite','comment','rating']
    });
    const recipeExist = await Recipe.findOne({recipeId:data.recipeId});

    if (recipeExist) {
      const indexOf = user.myRecipes.indexOf(recipeExist._id);
        if (indexOf > -1) {
            logger(
            'Recipe',
            `This recipe "${data.title}" is already one of the user ${user.id} 's favorite recipes`,
            'saveRecipe'
            );
            return user;
        } else {
            user.myRecipes.push(recipeExist.id);
            await user.save();
            console.log('here ', user.myRecipes)

            const updatedUser = await User.findById(userId)
            .populate({
                path:'myRecipes',
                select:['title', 'ingredients', 'instructions', 'image', 'servings', 'readyInMinutes','equipments','favorite','comment','rating']
            });
            return updatedUser;
      }
    } else {
        const equipmentList = Object.entries(data.equipments).map(([key, value]) => ({
            name: value,
          }));
        const instructionsList = Object.entries(data.instructions).map(([key, value]) => ({
        step: value,
        }));
        const recipe = new Recipe();
        Object.assign(recipe, {
            title: data.title.toLowerCase(),
            image:data.image,
            servings:data.servings,
            readyInMinutes:data.readyInMinutes,
            instructions:instructionsList,
            ingredients:data.ingredients,
            equipments:equipmentList,
            missing_ingredients:data.missing_ingredients,
            sourceUrl:data.sourceUrl,
            recipeId:data.recipeId,
        });
        await recipe.save();


        user.myRecipes.push(recipe.id);
        await user.save();
        const updatedUser = await User.findById(userId)
        .populate({
            path:'myRecipes',
            select:['title', 'ingredients', 'instructions', 'image', 'servings', 'readyInMinutes','equipments','favorite','comment','rating']
        });
        return updatedUser;
    }

};
/**
 * Get saved recipes by user
 * @param userId
 * @returns {Recipes}
 */
module.exports.getSavedRecipesByUserId = async(userId) => {
    const user = userService.getUserById(userId);
    return user.myRecipes;

};
/**
 * Delete a recipe
 * @param userId
 * @param recipeId
 * @returns {User}
 */
module.exports.delete = async(userId, recipeId) => {
    const user = userService.getUserById(userId);
    user.myRecipes.filter((id)=>id== recipeId).remove();
    return user;

};
function parseAPIRecipeDetails(complexData) {
    const recipeData = {};
  
    recipeData.id = complexData.id;
    recipeData.title = complexData.title;
    recipeData.servings = complexData.servings;
    recipeData.sourceUrl = complexData.sourceUrl;
    recipeData.image = complexData.image;
   
    recipeData.readyInMinutes = complexData.readyInMinutes || 0;
  
    const ingredients = [];
    for (const ingredient of complexData.extendedIngredients) {
      const ingredientDict = {};
      ingredientDict.id = ingredient.id;
      ingredientDict.name = ingredient.name;
      ingredientDict.amount = Math.round(ingredient.amount * 100) / 100;
      ingredientDict.unit = ingredient.measures.us.unitShort;
      ingredients.push(ingredientDict);
    }
    recipeData.ingredients = ingredients;
  
    const instructions = complexData.analyzedInstructions[0].steps.map((step) => `${step.number}. ${step.step}`);    
    recipeData.instructions = instructions;
  
    const equipment = complexData.analyzedInstructions[0].steps.reduce((acc, step) => {
      for (const equipment of step.equipment) {
        acc[equipment.name] = equipment.name;
      }
      return acc;
    }, {});
    recipeData.equipment = equipment;
  
    const missedIngredients = complexData.missedIngredients.map((ingredient) => {
      const ingredientDict = {};
      ingredientDict.name = ingredient.name;
      ingredientDict.amount = Math.round(ingredient.amount * 100) / 100;
      ingredientDict.unit = ingredient.unitShort;
      return ingredientDict;
    });
    recipeData.missing_ingredients = missedIngredients;
  
    return recipeData;
  }
  
/**
 * Search for a recipe
 * @param data
 * @returns {Recipes}
 */
module.exports.searchByIngredients = async ({ingredients}) => {
    const apiKey = '69808e0f62e54841a4cf9a114059a719'; // Replace with your own API key
    const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&includeIngredients=${ingredients}&addRecipeInformation=true&sort=max-used-ingredients&instructionsRequired=true&fillIngredients=true&number=15`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    try {
        const response = await axios.get(url, { headers });
        const recipes_complex_data = response.data.results;
      
        const recipe_results = [];
        for (const recipe of recipes_complex_data) {
          const recipe_data = parseAPIRecipeDetails(recipe);
          recipe_results.push(recipe_data);
        }
      
        return recipe_results;
      } catch (error) {
        console.error(error);
        throw new Error('Error fetching recipe data from API');
      }
};

/**
 * Favorite recipe
 * @param userId
 * @param recipeId
 * @param {favorite}
 * @returns {Recipe}
 */
module.exports.updateFavorite = async(userId,recipeId, {favorite}) => {
    const recipe = getOne(recipeId);
    const user = await User.findById(userId);
    const recipeIndex = user.myRecipes.findIndex(r => r._id.toString() === recipeId.toString());
    if(!recipeIndex){
        logger('Recipe', `Recipe with id #${data.title} not found user recipes list`, 'favorite');
        throw new BadRequestError('favorite')
    }
    user.myRecipes[recipeIndex].favorite = favorite;
    await user.save();
    return user
}
/**
 * Update rating of a recipe
 * @param userId
 * @param recipeId
 * @param {rating}
 * @returns {Recipe}
 */
module.exports.updateRating = async(userId,recipeId, {rating}) => {
    const recipe = getOne(recipeId);
    const user = await User.findById(userId);
    const recipeIndex = user.myRecipes.findIndex(r => r._id.toString() === recipeId.toString());
    if(!recipeIndex){
        logger('Recipe', `Recipe with id #${data.title} not found user recipes list`, 'rating');
        throw new BadRequestError('rating')
    }
    user.myRecipes[recipeIndex].rating = rating;
    await user.save();
    return user
}
/**
 * Add a comment
 * @param userId
 * @param recipeId
 * @param {comment}
 * @returns {Recipe}
 */
module.exports.addcomment = async(userId,recipeId, {comment}) => {
    const recipe = getOne(recipeId);
    const user = await User.findById(userId);
    const recipeIndex = user.myRecipes.findIndex(r => r._id.toString() === recipeId.toString());
    if(!recipeIndex){
        logger('Recipe', `Recipe with id #${data.title} not found user recipes list`, 'comment');
        throw new BadRequestError('comment')
    }
    user.myRecipes[recipeIndex].comment = comment;
    await user.save();
    return user
}

