const express = require('express')
const router = express.Router()

const {
  authentication,
  authorizePermissions,
} = require('../middleware/authentication')

const {
  generateProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require('../controllers/productController')

const { getSingleProductReviews } = require('../controllers/reviewController')

router
  .route('/')
  // [] içine almakla düz yazmak arasında bir fark var mı bilmiyorum.
  .post([authentication, authorizePermissions('admin')], generateProduct)
  .get(getAllProducts)

// Id olarak algılanacağı için ":id" route'undan önce tanımlanıyor.
router
  .route('/uploadImage')
  .post([authentication, authorizePermissions('admin')], uploadImage)

router
  .route('/:id')
  .get(getSingleProduct)
  .patch([authentication, authorizePermissions('admin')], updateProduct)
  .delete([authentication, authorizePermissions('admin')], deleteProduct)

router.route('/:id/reviews').get(getSingleProductReviews)

module.exports = router
