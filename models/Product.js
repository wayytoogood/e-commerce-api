const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      maxlength: [100, 'Name can not be longer than 75 characters'],
    },
    price: {
      type: Number,
      // Default değeri olduğu için required uyarısı alıcak mıyız bilmiyorum.
      required: [true, 'Please provide product price'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [10000, 'Description can not be longer than 1000 characters'],
    },
    image: {
      type: String,
      // Normalde default image genellikle frontend tarafından sağlanıyor, burada bir değişiklik yapıyoruz.
      default: '/uploads/example.jpg',
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['office', 'kitchen', 'bedroom'],
    },
    company: {
      type: String,
      required: [true, 'Please provide product company'],
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported',
      },
    },
    colors: {
      // String değerlere sahip array.
      type: [String],
      // Default değeri verilmediğinde required olmasına rağmen product oluştururken belirtimediğinde error almıyoruz ve boş bir array oluşturuluyor(color: []).
      default: ['#222'],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    // Stokta kaç tane eleman olduğunu gösteren property fakat bu projede kullanmıyoruz.
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    // Tipi User Modelindeki ObjectId'lerden biri olacak diyoruz.
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: 'true',
    },
  },
  {
    timestamps: true,
    // virtual'ın çalışması için aşağıdaki iki option'ı eklememiz gerekiyor.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Virtual database'de kayıtlı olmamasına rağmen populate('reviews') dediğimizde(en azından burda öyle yani) elde edebildiğimiz datalar. İlk parametresi virtual'ın ismini belirtiyor.
ProductSchema.virtual('reviews', {
  ref: 'Review', // hangi modele bakılacağı
  localField: '_id', //burdaki _id değeri, Review'deki product değeriyle eşleşen review'leri getiriyoruz.
  foreignField: 'product',
  justOne: false, // List şeklinde gelmesini istiyoruz.
  // match: {rating: 4}   // Yandaki gibi sınırlandırma koyarak sadece rating'i 4 olan review'leri getirebiliriz.
})

// Ürünleri sildiğimizde onlar hakkında yapılmış yorumların da silinmesini sağlıyoruz.
ProductSchema.pre('remove', async function () {
  // this'le farklı bir model'e de erişebiliyoruz.
  await this.model('Review').deleteMany({ product: this._id })
})

module.exports = mongoose.model('Product', ProductSchema)
