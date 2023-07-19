const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const { isTokenValid } = require('../utils')

const authentication = (req, res, next) => {
  let token

  const authHeader = req.headers.authorization
  const cookie = req.signedCookies.token

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1]
  } else if (cookie) {
    token = cookie
  }

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication invalid')
  }

  try {
    const payload = isTokenValid({ token })
    req.user = {
      userID: payload.userID,
      name: payload.name,
      role: payload.role,
    }
    next()
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication invalid Second')
  }
}

// Sadece verilen rollerin erişimi olmasını sağlıyor.
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      )
    }
    next()
  }
}

module.exports = { authentication, authorizePermissions }
