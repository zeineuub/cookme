const db = require('../core/helpers/db');
const {logger} = require('../core/helpers/logger');
const i18n = require('../core/services/i18n');
const UnprocessableEntityError = require('../core/errors/UnprocessableEntityError');
const userService = require('../user/user.service');
const BadRequestError = require('../core/errors/BadrequestError');
const moment = require('moment');

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
module.exports.getOne = async(userId, recipeId) => {
    const user = await User.findById(userId);
  
  
    const recipe = await Recipe.findOne({recipeId});
    if (!recipe) {
        logger('Recipe', `Recipe with id #${recipeId} not found`, 'getOne');
        throw new BadRequestError('getOne');
    }
    return recipe;
}
/**
 * Check value of property favorite
 * @param id
 * @returns {Recipe}
 */
module.exports.checkFavorite = async(userId, recipeId) => {
    const user = await User.findById(userId)
    .populate({
      path: 'myRecipes',
      populate: {
        path: '_id',
        select: ['title', 'ingredients', 'instructions', 'image', 'equipments', 'servings', 'readyInMinutes','recipeId']
      }
    });
    const recipeExist = await Recipe.findOne({recipeId});

    if (!recipeExist) {
        return false;
    } else {
        const recipeIndex = user.myRecipes.findIndex(
            (r) => r._id.toString() === recipeExist._id.toString()
        );
        if (recipeIndex > -1) {
            const recipe = user.myRecipes.find((r) => r._id.toString() === recipeExist.id);
            return recipe.favorite;
        } else {
            return false;

        }
    }
}
/**
 * Save recipe for user
 * @param userId
 * @param recipeId
 * @returns {User}
 */
module.exports.saveRecipe = async (userId, data) => {
    const user = await User.findById(userId);
    const recipeExist = await Recipe.findOne({ recipeId: data.recipeId });

    if (recipeExist) {
      const recipeIndex = user.myRecipes.findIndex(
        (r) => r._id.toString() === recipeExist._id.toString()
      );

      if (recipeIndex > -1) {
        logger(
          'Recipe',
          `This recipe "${data.title}" is already one of the user ${user.id}'s favorite recipes`,
          'saveRecipe'
        );
        return recipeExist;
      } else {
        user.myRecipes.push({
          _id: recipeExist._id,
          favorite: true,
        });
  
        await user.save();
        return recipeExist;
      }
    } else {
      const equipmentList = Object.entries(data.equipments).map(
        ([key, value]) => ({
          name: value,
        })
      );
      const instructionsList = Object.entries(data.instructions).map(
        ([key, value]) => ({
          step: value,
        })
      );
  
      const recipe = new Recipe({
        title: data.title,
        image: data.image,
        servings: data.servings,
        readyInMinutes: data.readyInMinutes,
        instructions: instructionsList,
        ingredients: data.ingredients,
        equipments: equipmentList,
        missingIngredients: data.missingIngredients,
        sourceUrl: data.sourceUrl,
        recipeId: data.recipeId,
      });
  
      await recipe.save();
      user.myRecipes.push({
        _id: recipe._id,
      });
  
      await user.save();
      return recipe;
    }
  };
/**
 * Get saved recipes by user
 * @param userId
 * @returns {Recipes}
 */
module.exports.getSavedRecipesByUserId = async(userId) => {
  
    const user = await User.findById(userId)
    .populate({
      path: 'myRecipes',
      populate: {
        path: '_id',
        select: ['title', 'ingredients', 'instructions', 'image', 'equipments', 'servings', 'readyInMinutes','recipeId']
      }
    });
    return user.myRecipes;

};
/**
 * Delete a recipe
 * @param userId
 * @param recipeId
 * @returns {User}
 */
module.exports.delete = async(userId, recipeId) => {

  const recipe = await Recipe.findOne({ recipeId});
  const user = await User.findById(userId)
  .populate({
    path: 'myRecipes',
    populate: {
      path: '_id',
      select: ['title', 'ingredients', 'instructions', 'image', 'equipments', 'servings', 'readyInMinutes','recipeId']
    }
  });

  const index = user.myRecipes.findIndex(recipe => recipe._id.recipeId === recipeId);
  if (index !== -1) {
    const [removedRecipe] = user.myRecipes.splice(index, 1);
    await user.save();
    return  user.myRecipes;
  }
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
 * Update recipe
 * @param userId
 * @param recipeId
 * @param {favorite}
 * @returns {Recipe}
 */
module.exports.updateRecipe = async(userId, recipeId, data) => {
    const user = await User.findById(userId);
    const recipeIndex = user.myRecipes.findIndex(r => r._id.toString() === recipeId);
    if (recipeIndex === -1) {
        throw new BadRequestError(`Recipe with id ${recipeId} not found in user recipes list`);
    }
    const updatedRecipe = {
        favorite: data.favorite,
        comment: data.comment,
        rating: data.rating,
        tried: data.tried
    };
    user.myRecipes[recipeIndex] = { ...user.myRecipes[recipeIndex], ...updatedRecipe };
    await user.save();
    return user;
};

/**
 * Favorite recipe
 * @param userId
 * @param recipeId
 * @param {favorite}
 * @returns {Recipe}
 */
module.exports.updateFavorite = async(userId,recipeId, {favorite}) => {
  const recipe = await Recipe.findOne({recipeId});

  if(!recipe){
      logger('Recipe', `Recipe with id #${recipeId} not found `, 'updateFavorite');
      throw new BadRequestError('updateFavorite')
  }
  const user = await User.findById(userId)
  .populate({
    path: 'myRecipes',
    populate: {
      path: '_id',
      select: ['title', 'ingredients', 'instructions', 'image', 'equipments', 'servings', 'readyInMinutes','recipeId']
    }
  });

  const recipeIndex = user.myRecipes.findIndex(r => r._id.recipeId === recipeId);
  if(recipeIndex > -1){
    user.myRecipes[recipeIndex].favorite = favorite;
    await user.save();
    const res={
      favorite:user.myRecipes[recipeIndex].favorite
    }
    return res;
      
  } else {
    logger('Recipe', `Recipe with id #${recipeId} not found user recipes list`, 'favorite');
      throw new BadRequestError(`Recipe with id #${recipeId} not found user recipes list`)
  }
 
}
/**
 * Update rating of a recipe
 * @param userId
 * @param recipeId
 * @param {rating}
 * @returns {Recipe}
 */
module.exports.updateRating = async(userId,recipeId, {rating}) => {
    const recipe = await Recipe.findOne({recipeId});
    if(!recipe){
      logger('Recipe', `Recipe with id #${recipeId} not found `, 'updateRating');
      throw new BadRequestError('updateRating')
    }
    const user = await User.findById(userId)
    .populate({
      path: 'myRecipes',
      populate: {
        path: '_id',
        select: ['title', 'ingredients', 'instructions', 'image', 'equipments', 'servings', 'readyInMinutes','recipeId']
      }
    });
  
    const recipeIndex = user.myRecipes.findIndex(r => r._id.recipeId === recipeId);
    if(recipeIndex > -1){
      user.myRecipes[recipeIndex].rating = rating;
      await user.save();
      const res={
        rating: user.myRecipes[recipeIndex].rating
      }
      return res;
        
    } else {
      logger('Recipe', `Recipe with id #${recipeId} not found user recipes list`, 'favorite');
        throw new BadRequestError(`Recipe with id #${recipeId} not found user recipes list`)
    }
   
    
}
/**
 * Add a comment
 * @param userId
 * @param recipeId
 * @param {comment}
 * @returns {Recipe}
 */
module.exports.addcomment = async (userId, recipeId, { comment }) => {
  console.log(comment)
  const recipe = await Recipe.findOne({recipeId})
  if(!recipe){
    logger('Recipe', `Recipe with id #${recipeId} not found `, 'addcomment');
    throw new BadRequestError('addcomment')
  }
  const user = await User.findById(userId);
  const commentIndex = recipe.comments.findIndex(
    (r) => r.user.toString() === userId
  );
  if (commentIndex === -1) {
    const newComment = {
      user: userId,
      comment: [{ text: comment, createdAt: moment().format('YYYY-MM-DD HH:mm') }]
    }
    recipe.comments.push(newComment);
  } else {
    recipe.comments[commentIndex].comment.push({ text: comment, createdAt: moment().format('YYYY-MM-DD HH:mm') });
  }
  await recipe.save();
  const updateRecipe = await Recipe.findOne({userId})
  .populate({
    path: 'comments',
    populate: {
      path: 'user',
      select: ['firstName', 'lastName', 'email']
    }
  });
  console.log(updateRecipe.comments[updateRecipe.comments.length - 1].comment[updateRecipe.comments[updateRecipe.comments.length - 1].comment.length - 1])
  return updateRecipe.comments[updateRecipe.comments.length - 1].comment[updateRecipe.comments[updateRecipe.comments.length - 1].comment.length - 1];
};



/**
 * Get saved recipe by recipeId
 * @param userId
 * @returns {Recipes}
 */
module.exports.isSaved = async (userId, recipeId) => {
  let res;
  const recipe = await Recipe.findOne({recipeId});
  if(!recipe){
    res = {
      saved: false
    } 
  }
  const user = await User.findById(userId)
  .populate({
    path: 'myRecipes',
    populate: {
      path: '_id',
      select: ['title', 'ingredients', 'instructions', 'image', 'equipments', 'servings', 'readyInMinutes','recipeId']
    }
  });
  const recipeIndex = user.myRecipes.findIndex(r => r._id.recipeId === recipeId);

  if(recipeIndex > -1){
     res = {
      saved: true
    } 

  } else  {
     res = {
      saved: false
    } 
  }
  return res

}

/**
 * Get saved recipe by recipeId
 * @param userId
 * @returns {Recipes}
 */
module.exports.getComments = async (recipeId) => {
const recipe = await Recipe.findOne({recipeId})
.populate({
  path: 'comments',
  populate: {
    path: 'user',
    select: ['firstName', 'lastName', 'email']
  }
});
return recipe.comments;


}