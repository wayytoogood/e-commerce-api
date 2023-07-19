const {
  generateToken,
  isTokenValid,
  attachCookiesToResponse,
} = require('./jwt')

const generateTokenUser = require('./generateTokenUser')
const checkPermissions = require('./checkPermissions')

module.exports = {
  generateToken,
  isTokenValid,
  attachCookiesToResponse,
  generateTokenUser,
  checkPermissions,
}
