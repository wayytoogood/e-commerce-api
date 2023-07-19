const Order = require('../models/Order')
const Product = require('../models/Product')

const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const { checkPermissions } = require('../utils')
const { Schema } = require('mongoose')

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'CLIENT_SECRET'
  return { client_secret, amount }
}

const generateOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('List can not be empty')
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError('Please provide tax and shipping fee')
  }

  let orderItems = []
  let subtotal = 0

  // forEach ya da map'in içinde await'i kullanamadığımız için for of kullanıyoruz.
  // Bu döngü stripe'ın vermiş olduğu calculateOrderAmount'ın içinde dönmesi gerekenler.
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product })

    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `There is no product with id: ${item.product}`
      )
    }

    const { name, price, image, _id } = dbProduct

    const singleOrderItem = {
      name,
      price,
      image,
      amount: item.amount,
      product: _id,
    }

    orderItems = [...orderItems, singleOrderItem]

    subtotal += item.amount * price
  }

  const total = subtotal + tax + shippingFee

  // Bu örnekte stripe api yerine fake bir fonksiyon kullanıyoruz. Normalde stripe.paymentIntents.create'i kullanıyorduk.
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd',
  })

  const order = await Order.create({
    tax,
    subtotal,
    total,
    shippingFee,
    orderItems,
    user: req.user.userID,
    clientSecret: paymentIntent.client_secret,
  })

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret })
}

const getAllOrders = async (req, res) => {
  const orders = await Order.find({})

  res.status(StatusCodes.OK).json({ orders, count: orders.length })
}

const getSingleOrder = async (req, res) => {
  const { id } = req.params

  const order = await Order.findOne({ _id: id })

  if (!order) {
    throw new CustomError.NotFoundError(`There is no order with id: ${id}`)
  }

  checkPermissions(req.user, order.user)

  res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userID })
  res.status(StatusCodes.OK).json({ orders, count: orders.length })
}

const updateOrder = async (req, res) => {
  const { id } = req.params
  // Her şey doğru gerçekleşirse paymentIntentID'ye erişiyomuşuz, büyük ihtimal satış bittikten sonra stripe tarafından veriliyor.
  const { paymentIntentID } = req.body

  const order = await Order.findOne({ _id: id })

  if (!order) {
    throw new CustomError.NotFoundError(`There is no order with id: ${id}`)
  }

  checkPermissions(req.user, order.user)

  order.paymentIntentID = paymentIntentID
  order.status = 'paid'

  await order.save()

  res.status(StatusCodes.OK).json({ order })
}

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  generateOrder,
  updateOrder,
}
