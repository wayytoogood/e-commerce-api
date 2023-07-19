const User = require('../models/User')
const StatusCodes = require('http-status-codes')
const CustomError = require('../errors')
const {
  generateTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils')

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password')
  res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
  const { id } = req.params
  const user = await User.findOne({ _id: id }).select('-password')

  if (!user) {
    throw new CustomError.NotFoundError(
      `There is no user with given id of ${id}`
    )
  }

  // Admin değilse kullanıcıların sadece kendi profilini görebilmesi sağlanıyor.
  checkPermissions(req.user, user._id)

  res.status(StatusCodes.OK).json({ user })
}

// Browser yenilendiğinde user'la alakalı bilgilerin görülmesini istiyoruz, bu nedenle istenilen route'ların hepsinde sayfa yüklendiğinde çağrılcak aşağıdaki
// gibi bir endpoint oluşturuyoruz.
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user })
}

// Update user with findOneAndUpdate
// const updateUser = async (req, res) => {
//   // Sadece name ve email'in değiştirilebilmesini istiyoruz.
//   const { name, email } = req.body
//   const { userID } = req.user

//   if (!name || !email) {
//     throw new CustomError.NotFoundError(`Name and email must be provided`)
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: userID },
//     { name, email },
//     {
//       new: true,
//       runValidators: true,
//     }
//   )

//   // Kullanıcı bilgileri değişeceği için yeni cookie oluşturmalıyız.
//   const tokenUser = generateTokenUser(user)
//   attachCookiesToResponse(res, tokenUser)
//   res.status(StatusCodes.OK).json({ user: tokenUser })
// }

// Update user with save method
const updateUser = async (req, res) => {
  const { name, email } = req.body
  const { userID } = req.user

  if (!name || !email) {
    throw new CustomError.NotFoundError(`Name and email must be provided`)
  }
  const user = await User.findOne({ _id: userID })

  user.name = name
  user.email = email

  // save fonksiyonu database'e kaydetmeden önce çağrılan fonksiyon oluyor, burada password'ü hasleme gerçekleşiyor. Yani şifre bi kere daha hash'leneceği için
  // şifrenin güncel haline sahip olmamış olucaz. Bu nedenle save fonksiyonunda bunu düzeltmemiz gerekiyor.
  await user.save()

  // Kullanıcı bilgileri değişeceği için yeni cookie oluşturmalıyız.
  const tokenUser = generateTokenUser(user)
  attachCookiesToResponse(res, tokenUser)
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  console.log(oldPassword, newPassword)

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      `Old password and new password should be entered`
    )
  }

  const user = await User.findOne({ _id: req.user.userID })

  const isPasswordCorrect = await user.comparePassword(oldPassword)

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError(
      `Provided old password is not match with true value`
    )
  }

  user.password = newPassword

  // Değiştirilen user'ı database'e kaydediyor. Burdaki save User modelindeki save'le aynı, yani database'e kaydederken şifreyi hash'liyoruz da.
  await user.save()

  res.status(StatusCodes.OK).json({ msg: 'Success password updated!' })
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
