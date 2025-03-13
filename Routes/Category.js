const {
  getSubcategoriesByCategory,
  addCategory,
  getCategories,
  deleteCategory,
  addSubcategory,
  deleteSubcategory,
} = require("../Controllers/Category/Category");
const { auth } = require("../Middlewares/auth");
// Middleware to handle file upload
const router = require("express").Router();

router.post("/add-category", auth, addCategory);
router.get("/get-categories", getCategories);
router.delete("/delete-category", auth, deleteCategory);
router.post("/add-subcategory", auth, addSubcategory);
router.get("/get-subcategories/:categoryId", getSubcategoriesByCategory);
router.delete("/delete-subcategory", auth, deleteSubcategory);

module.exports = router;
