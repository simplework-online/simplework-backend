const Joi = require("joi");
const { Category, Subcategory } = require("../../Models/Category");

const addCategory = async (req, res) => {
console.log("body=====>>>", req.body);
    const value = Joi.object({
        category: Joi.string().required()
    }).validate(req.body)
    if (value.error) {
        return res.status(400).json({ message: value.error.details[0].message });
    }

    try {
        const { category } = req.body;

        const newCategory = new Category({
            category
        });
        const savedCategory = await newCategory.save();
        if (!savedCategory) {
            return res.status(500).json({ message: "Category not saved" });
        }
        return res.status(200).json({ message: "Category saved", category: savedCategory });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }

}

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        if (!categories) {
            return res.status(500).json({ message: "Categories not found" });
        }
        return res.status(200).json({ categories });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const deleteCategory = async (req, res) => {
    const value = Joi.object({
        categoryId: Joi.string().required()
    }).validate(req.body)
    if (value.error) {
        return res.status(400).json({ message: value.error.details[0].message });
    }
    try {
        const { categoryId } = req.body;
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(500).json({ message: "Category not deleted" });
        }
        return res.status(200).json({ message: "Category deleted" });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const addSubcategory = async (req, res) => {
    const value = Joi.object({
        categoryId: Joi.string().required(),
        subcategory: Joi.string().required()
    }).validate(req.body)
    if (value.error) {
        return res.status(400).json({ message: value.error.details[0].message });
    }
    try {
        const { categoryId, subcategory } = req.body;


        const createSubCategory = new Subcategory({
            name: subcategory,
            categoryId
        });

        const savedSubCategory = await createSubCategory.save();
        if (!savedSubCategory) {
            return res.status(500).json({ message: "Subcategory not saved" });
        }
        // append subcategory to category

        const AppendSubCatId = await Category.findByIdAndUpdate(categoryId, { $push: { subcategories: savedSubCategory._id } });
        if (!AppendSubCatId) {
            return res.status(500).json({ message: "Subcategory not saved" });
        }

        return res.status(200).json({ message: "Subcategory saved" });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}


const deleteSubcategory = async (req, res) => {
    const value = Joi.object({
        subcategoryId: Joi.string().required()
    }).validate(req.body)

    if (value.error) {
        return res.status(400).json({ message: value.error.details[0].message });
    }

    try {
        const { subcategoryId } = req.body;
        const deletedSubcategory = await Subcategory.findByIdAndDelete(subcategoryId);
        if (!deletedSubcategory) {
            return res.status(500).json({ message: "Subcategory not deleted" });
        }
        return res.status(200).json({ message: "Subcategory deleted" });
    }


    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getSubcategoriesByCategory = async (req, res) => {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate("subcategories").lean().exec()
        .then((category) => {
            return res.status(200).json({ subcategories: category });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: "Internal server error" });
        });

}




const getSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find();
        if (!subcategories) {
            return res.status(500).json({ message: "Subcategories not found" });
        }
        return res.status(200).json({ subcategories });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    addCategory,
    getCategories,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    getSubcategoriesByCategory,
    getSubcategories
}

