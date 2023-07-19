const express = require('express')
const router = express.Router()

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  generateOrder,
  updateOrder,
} = require('../controllers/orderController')

const {
  authentication,
  authorizePermissions,
} = require('../middleware/authentication')

router
  .route('/')
  .get([authentication, authorizePermissions('admin')], getAllOrders)
  .post(authentication, generateOrder)

router.route('/showAllMyOrders').get(authentication, getCurrentUserOrders)

router
  .route('/:id')
  .get(authentication, getSingleOrder)
  .patch(authentication, updateOrder)

module.exports = router
