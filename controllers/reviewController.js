const Review = require('../models/Review')
const Product = require('../models/Product')
const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const { checkPermissions } = require('../utils')

const generetaReview = async (req, res) => {
  const { product: productID } = req.body

  const isValidProduct = await Product.findOne({ _id: productID })
  // gerçek bir ürüne yorum yapılmadığına bakılıyor.
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id: ${productID}`)
  }
  // Şemada her kullanıcının bir ürün için bi review hakkı olması Schema'nın içinde sağlanmıştı, aynı şekilde aşağıdaki gibi controller'da da sağlanabiliyor.
  const alreadySubmitted = await Review.findOne({
    product: productID,
    user: req.user.userID,
  })

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      `Already submitted review for this product`
    )
  }

  req.body.user = req.user.userID

  const review = await Review.create(req.body)

  res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
  // **product property'sine name, company ve price ekleniyor, fakat bunun sağlanması için model'de product'ın ref="Product" ı belirtmesi şart.
  const reviews = await Review.find({}).populate({
    path: 'product',
    select: 'name company price',
  })
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const getSingleReview = async (req, res) => {
  const { id } = req.params
  const review = await Review.findOne({ _id: id })

  if (!review) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`)
  }
  res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
  const { id } = req.params
  const { title, comment, rating } = req.body

  // Review'i değiştirmeden önce oluşturulan kişi tarafından mı değiştirilmeye çalışıldığını bulmalıyız bu nedenle findOneAndUpdate kullanamayız, aynısı delete review için de geçerli.
  // Ama sanırım burada avarageRating'i falan da kaydederken hesaplamak istiyoruz, o nedenle kullanıldı.
  const review = await Review.findOne({ _id: id })
  if (!review) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`)
  }

  checkPermissions(req.user, review.user)

  review.title = title
  review.comment = comment
  review.rating = rating

  await review.save()

  res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
  const { id } = req.params
  const review = await Review.findOne({ _id: id })
  if (!review) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`)
  }

  checkPermissions(req.user, review.user)

  await review.remove()

  res.status(StatusCodes.OK).json({ msg: 'Review removed' })
}

// Bir product'ın sahip olduğu review'leri veriyor, virtual'ın aksine bunu query'liyebiliyomuşuz(rating: {$gte: 4} gibi query'lerden bahsediyo olabilir, tam olarak neyi kastettiğini anlamadım.)
const getSingleProductReviews = async (req, res) => {
  const { id } = req.params
  const reviews = await Review.find({ product: id })

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

module.exports = {
  generetaReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
}
