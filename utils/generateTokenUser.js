const generateTokenUser = (user) => {
  return { userID: user._id, name: user.name, role: user.role }
}

module.exports = generateTokenUser
