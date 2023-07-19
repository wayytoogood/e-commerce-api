const jwt = require('jsonwebtoken')

const generateToken = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })
  return token
}

const isTokenValid = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

const attachCookiesToResponse = (res, user) => {
  const token = generateToken({ payload: user })
  // token bitiş zamanıyla cookie bitiş zamanını eşleştiriyoruz.
  const oneDay = 1000 * 60 * 60 * 24

  // sırasıyla cookie'nin ismi değeri ve ayarları belirtiliyor.
  // **local storage'da sakladığımız durumda burda olduğu gibi direk server üzerinde token'i storage'a atma şansımız yoktu, bunun için frontent kullanılıyordu.
  res.cookie('token', token, {
    httpOnly: true, //sadece web server'larından erişim sağlanabileceği belirtiliyor.
    expires: new Date(Date.now() + oneDay),
    // secure sadece https server'lar üzerinden erişime izin verdiği için development'ta true yapamyoruz.
    secure: process.env.NODE_ENV === 'production',
    // JWT_SECRET'ı eklemekle aynı işlevde.
    signed: true,
  })
}

module.exports = { generateToken, isTokenValid, attachCookiesToResponse }
