require('dotenv').config()
require('express-async-errors')
// express
const express = require('express')
const app = express()
// rest of packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimiter = require('express-rate-limit')
// database
const connectDB = require('./db/connect')
// routers
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')
// middlewares
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
// 3th party middlewares
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.static('./public'))
// security packages
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())
app.set('trust proxy', 1)
app.use(
  rateLimiter({
    windowMs: 1000 * 60 * 15,
    max: 100,
  })
)
// kullanıcının çerez üzerinde değişiklik yaptığında saptanmasını kolaylaştırması için sign parametresini giriyoruz.
app.use(cookieParser(process.env.JWT_SECRET))
app.use(fileUpload())
// routes
app.get('/', (req, res) => {
  res.send('Ecommerce Site')
})

app.get('/api/v1', (req, res) => {
  // console.log(req.cookies)
  // Sign'lanmış çerezlere signedCookies'le erişiyoruz.
  console.log(req.signedCookies)
  res.send('Ecommerce Site')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter)

app.use(notFoundMiddleware)
// Sadece bunun üstünde belirtilen route'lardan birinde hata gerçekleştiğinde devreye giriyor.
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, console.log(`Server is listening on port ${port}`))
  } catch (error) {
    console.log(error)
  }
}

start()
