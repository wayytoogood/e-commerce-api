const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review name'],
      maxlength: [100, 'Title can not be longer than 100 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide review rating'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment'],
      maxlength: [10000, 'Comment can not be longer than 1000 characters'],
    },
    // Review'i hangi user'ın yaptığı.
    user: {
      // ben bir sıkıntıyla karşılaşmadım ama mongoose object tipleri belirtilirken aşağıdaki gibi Schema'nın eklenmesi tavsiye ediliyor.
      // type: mongoose.Schema.Types.ObjectId,
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Review'in hangi product'a yapıldığı.
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// *Her review'ün bir user'ı ve bir product'ı olacak ve bu ikisini **birlikte ele aldığımızda diğer review'lerden farklı olacak. Eğer user ve product'a ayrı ayrı unique yazsaydık
// aynı product'a birden fazla kullanıcı yorum yapamıyor olacaktı.
ReviewSchema.index({ user: 1, product: 1 }, { unique: true })

// Her yeni review oluşturulduğunda ya da değiştirildiğinde o review'in yapıldığı product'a ait bütün review'ler toplanıyor ve ortalama puan ve toplam yorum hesaplanıyor.
// Daha sonra da bu değerler ilgili product'a geçiriliyor.
ReviewSchema.statics.calculateAvarageRating = async function (productID) {
  // Değerlerin bir araya getirilmesine aggregation deniyor.
  const result = await this.aggregate([
    {
      $match: { product: productID },
    },
    {
      $group: {
        // Buradaki id sınıflandırmanın nasıl olacağını belirtiyor, örneğin _id: "$rating" yazsaydık, review'leri rating değerleri aynı gruba gelecek şekilde
        // ayıracartı, null yazınca hiçbir sınıflandırma yapmıyor.
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ])

  // result [{_id: 123, avarageRating: 4, numOfReviews: 2}] gibi bir array veriyor.
  console.log(result)

  try {
    await this.model('Product').findOneAndUpdate(
      { _id: productID },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    )
  } catch (error) {
    console.log(error)
  }
}

// pre'den farkı bunda controller'da save hook'u çağrılmamış bile olsa database'e bir şey kaydediliyorsa çağrılıyor olması. Örneğin bu örnekte generateReview'de de çağrılıyor(post metodu kullanıldığı için de olabilir).
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAvarageRating(this.product)
})

ReviewSchema.post('remove', async function () {
  await this.constructor.calculateAvarageRating(this.product)
})

module.exports = mongoose.model('Review', ReviewSchema)
