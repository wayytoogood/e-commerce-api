const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { attachCookiesToResponse, generateTokenUser } = require('../utils')

const register = async (req, res) => {
  // Post request'le role'ü admin olarak belirtebileceğimiz için buraya dahil etmiyoruz.
  const { name, email, password } = req.body

  const emailIsInUse = await User.findOne({ email })
  if (emailIsInUse) {
    throw new CustomError.BadRequestError('email already exists')
  }

  // Oluşturulan ilk kullanıcının rolü admin diğerlerinin role'ü user oluyor.
  const isFirstUser = (await User.countDocuments({})) === 0
  const role = isFirstUser ? 'admin' : 'user'

  const user = await User.create({ name, email, password, role })
  const tokenUser = generateTokenUser(user)

  attachCookiesToResponse(res, tokenUser)
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new CustomError.BadRequestError('user and password must be added')
  }

  const user = await User.findOne({ email })
  const tokenUser = generateTokenUser(user)

  if (!user) {
    throw new CustomError.UnauthenticatedError('there is user with this email')
  }

  const isPasswordCorrect = await user.comparePassword(password)

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('incorrect password')
  }

  attachCookiesToResponse(res, tokenUser)
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, res) => {
  // Burda biraz sonra silineceği için zaten cookie'nin değerinin ne olduğunun bir önemi yok.
  res.cookie('token', 'logout', {
    httpOnly: true,
    // Aşağıdaki gibi 3 saniye sonra kaybolsun dediğimizde browser dev tool'da refresh yaptığımızda çerezin kaybolduğunu görüyoruz fakat postman'de kaybolmuyor,
    // bu nedenle altındaki gibi içinde bulunulan verilen tarihi vererek çerezi direk silebiliyoruz.
    // expires: new Date(Date.now() + 1000 * 3),
    expires: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: 'User logged out!' })
}

module.exports = { register, login, logout }
