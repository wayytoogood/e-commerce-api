const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'username must be provided'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'email must be provided'],
    // Bu sefer unique email kontrolünü controller'da yapıyoruz.
    // unique: ['true', 'there is already an account with this email'],
    validate: {
      // normalde validator girilen email değerini parametre olarak alıp sonucunda validate olup olmadığını döndüren bir fonksiyona eşit oluyor.
      // validator paketinin is Email fonksiyonu da aynı işlevi yerine getiriyor. Bunun yerine aşağıdaki match'de önceki projelerde olduğu gibi kullanılabilir.
      validator: validator.isEmail,
      message: 'provide a valid email',
    },
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   'Please fill a valid email address',
    // ],
  },
  password: {
    type: String,
    required: [true, 'password must be provided'],
    minlength: 6,
    maxlength: 75,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

UserSchema.pre('save', async function () {
  // console.log(this.modifiedPaths()) => array içinde değişiklik olan kısımları veriyor, ['name', 'email'] gibi.
  if (!this.isModified('password')) return // şifrede değişiklik yoksa hash'leme gerçekleşmesin diyerek, updateUser'daki sıkıntıdan kurtuluyoruz.
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)
