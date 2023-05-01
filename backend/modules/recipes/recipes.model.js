    const mongoose = require("mongoose")
    const beautifyUnique = require('mongoose-beautiful-unique-validation');
    const {Schema} = mongoose;

    const RecipeSchema = new Schema({
        recipeId:{
            type: String,
            unique:true
        },
        title: {
            type: String,
        },
        image: { 
            type: String 
        },
        servings: { 
            type: Number 
        },
        sourceUrl: { 
            type: String 
        },
        readyInMinutes: { 
            type: Number 
        },
        cuisines: { 
            type: Number 
        },
        dishTypes:[{
            type: String
        }],
        diets:[{
            type: String
        }],
        instructions: [{
            step: { 
                type: String 
            },
        }],
        ingredients: [{
            amount: { 
                type: Number 
            },
            unit: { 
                type: String 
            },
            name: { 
                type: String 
            },
        }],
        equipments: [{ 
            name:{
                type: String 
            }
        }],
        favorite: { 
            type: Boolean, 
            default: false 
          },
        tried: { 
            type: Boolean, 
            default: false 
        },
        rating: { 
            type: Number 
        },
        comment: { 
            type: String 
        }, 

    },
    {
        timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        },
        toObject: {
        virtuals: true,
        },
    }
    );

    RecipeSchema.plugin(beautifyUnique, {
    defaultMessage: '{VALUE} est déja inscrit',
    });
    RecipeSchema.set('toJSON', { virtuals: true });
    
    /**
     * toJSON implementation
     */
    RecipeSchema.options.toJSON = {
        transform(doc, ret) {
        const r = ret;
        r.name = doc.name;
        r.id = r._id;
        delete r._id;
        delete r.__v;
        return r;
        },
    };
    module.exports = mongoose.model('Recipe', RecipeSchema);