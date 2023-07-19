const express = require('express')
const router = express.Router()

const {
  generetaReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController')

const { authentication } = require('../middleware/authentication')

router.route('/').get(getAllReviews).post(authentication, generetaReview)

router
  .route('/:id')
  .get(getSingleReview)
  .patch(authentication, updateReview)
  .delete(authentication, deleteReview)

module.exports = router
