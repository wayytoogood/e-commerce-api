const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const path = require('path')

const generateProduct = async (req, res) => {
  req.body.user = req.user.userID

  const product = await Product.create(req.body)

  res.status(StatusCodes.CREATED).json({ product })
}

const getAllProducts = async (req, res) => {
  const products = await Product.find({})
  res.status(StatusCodes.OK).json({ products, count: products.length })
}

const getSingleProduct = async (req, res) => {
  const { id } = req.params
  // review virtual'ı ekleniyor.
  const product = await Product.findOne({ _id: id }).populate('reviews')

  if (!product) {
    throw new CustomError.NotFoundError(`No product with the id of ${id}`)
  }

  res.status(StatusCodes.OK).json({ product })
}

const updateProduct = async (req, res) => {
  const { id } = req.params
  const product = await Product.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  })

  if (!product) {
    throw new CustomError.NotFoundError(`No product with the id of ${id}`)
  }

  res.status(StatusCodes.OK).json({ product })
}

const deleteProduct = async (req, res) => {
  const { id } = req.params
  const product = await Product.findOne({ _id: id })

  if (!product) {
    throw new CustomError.NotFoundError(`No product with the id of ${id}`)
  }

  // Product'la beraber hakkındaki yorumları da silmek için findOneAndDelete yerine remove metodu kullanılıyor.
  await product.remove()

  res.status(StatusCodes.OK).json({ msg: 'Product removed' })
}

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No file picked for upload')
  }

  const file = req.files.image

  if (!file.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Only image files can be uploaded')
  }

  const maxSize = 1024 * 1024

  if (file.size > maxSize) {
    throw new CustomError.BadRequestError(
      'Image size can not be bigger that 10 mb'
    )
  }

  const uploadPath = path.resolve(
    __dirname,
    '../public/uploads/' + `${file.name}`
  )

  await file.mv(uploadPath)

  res.status(StatusCodes.OK).json({ image: `/uploads/${file.name}` })
}

module.exports = {
  generateProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
}
