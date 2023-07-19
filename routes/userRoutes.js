const express = require('express')
const router = express.Router()
const {
  authentication,
  authorizePermissions,
} = require('../middleware/authentication')

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require('../controllers/userController')

router
  .route('/')
  // Bu endpoint'e birden fazla rolün erişim hakkı olduğu düşünüldüğünde aşağıdaki gibi yazmalıyız, fakat bu durumda sadece fonksiyon referansı kabul edildiğinden
  // authorizePermissions('admin', 'owner') bir control fonksiyonu döndürmeli.
  .get(authentication, authorizePermissions('admin', 'owner'), getAllUsers)
// **Eğer getSingleUser endpoint'i bundan önce koyuluyrsa, /shopMe'yi ve diğer iki endpoint' de id olarak algılayacağı için bu id'ye sahip bir user yok error'u alacağız.
router.route('/showMe').get(authentication, showCurrentUser)
router.route('/updateUser').patch(authentication, updateUser)
router.route('/updateUserPassword').patch(authentication, updateUserPassword)

router.route('/:id').get(authentication, getSingleUser)

module.exports = router
