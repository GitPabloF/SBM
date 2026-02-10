const mongoose = require("mongoose")

const isProd = process.env.NODE_ENV === "production"

const sampleAdmin = {
  name: "Admin User",
  email: process.env.SEED_ADMIN_EMAIL || "admin@local.dev",
  password: process.env.SEED_ADMIN_PASSWORD || "changeme123",
  role: "admin",
}

const sampleUser = {
  name: "John Doe",
  email: process.env.SEED_USER_EMAIL || "user@local.dev",
  password: process.env.SEED_USER_PASSWORD || "changeme123",
  role: "user",
}

const sampleBookmarks = [
  {
    url: "https://mongoosejs.com",
    title: "Mongoose Documentation",
    tags: ["development", "database"],
  },
  {
    url: "https://expressjs.com",
    title: "Express.js",
    tags: ["development", "backend"],
  },
]

const seed = async () => {
  if (isProd) {
    console.error("SECURITY: Cannot run seed script in production!")
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    const User = mongoose.connection.collection("users")
    const Bookmark = mongoose.connection.collection("bookmarks")

    console.log("Clearing old data...")
    await User.deleteMany({})
    await Bookmark.deleteMany({})

    console.log("Creating users...")
    const { insertedId: adminId } = await User.insertOne(sampleAdmin)
    await User.insertOne(sampleUser)

    console.log("Creating bookmarks...")
    await Bookmark.insertMany(
      sampleBookmarks.map((item) => ({ userId: adminId, ...item })),
    )

    console.log("Seeding complete!")
    console.log(`Admin: ${sampleAdmin.email} / ${sampleAdmin.password}`)
    console.log(`User: ${sampleUser.email} / ${sampleUser.password}`)

    await mongoose.connection.close()
  } catch (error) {
    console.error("Error seeding:", error)
    process.exit(1)
  }
}

seed()
