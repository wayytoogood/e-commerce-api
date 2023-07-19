const CustomError = require('../errors')

const checkPermissions = (requestUser, resourceUserID) => {
  if (requestUser.role === 'admin') return
  // **user._id'den gelen yani database'de kayıtlı olan id değeri object olduğu için string'e çevirmemiz gerekiyor.
  if (requestUser.userID === resourceUserID.toString()) return
  throw new CustomError.UnauthorizedError(
    'Not Authorized to Access to this route'
  )
}

module.exports = checkPermissions
