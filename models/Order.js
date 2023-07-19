const mongoose = require('mongoose')

const SingleOrderItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true },
})

const OrderSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    // Subtotal cart'taki item'ların toplam tutarı.
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: [true, 'Please provide order shipping fee'],
      default: 0,
    },
    // İçine String, Number gibi değerlerin yanı sıra Schema'da alabiliyor.
    orderItems: [SingleOrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'failed', 'paid', 'delivered'],
      default: 'pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer must be specified'],
    },
    clientSecret: {
      type: String,
      required: true,
    },
    // Bu ödeme gerçekleştikten sonra stripe tarafından veriliyor sanırım.
    paymentIntentID: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Order', OrderSchema)
