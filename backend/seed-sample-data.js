import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.model.js";
import Product from "./models/Product.model.js";

const run = async () => {
    try {
        await connectDB();

        const sellerEmail = "seller@example.com";
        let seller = await User.findOne({ email: sellerEmail });

        if (!seller) {
            seller = await User.create({
                name: "Demo Seller",
                email: sellerEmail,
                password: "Password123",
                role: "seller",
                sellerProfile: {
                    storeName: "TechRelive Store",
                    bio: "Quality refurbished gadgets with verified seller service.",
                    rating: 4.9,
                },
                isVerified: true,
            });
            console.log(`Created seller: ${seller.email}`);
        } else {
            console.log(`Seller already exists: ${seller.email}`);
        }

        const productTitle = "Apple iPhone 12 Pro Max 128GB";
        const existingProduct = await Product.findOne({ title: productTitle });

        if (!existingProduct) {
            const product = await Product.create({
                title: productTitle,
                description:
                    "Apple iPhone 12 Pro Max in excellent condition with 128GB storage, fully tested and ready to ship.",
                price: 42999,
                originalPrice: 69999,
                category: "Mobile",
                condition: "A",
                conditionDetails: "Like New – Minimal to no signs of use, all original accessories included.",
                images: [
                    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                ],
                brand: "Apple",
                model: "iPhone 12 Pro Max",
                specifications: {
                    Color: "Pacific Blue",
                    Storage: "128GB",
                    RAM: "6GB",
                    Battery: "3687mAh",
                    Network: "5G",
                },
                tags: ["apple", "iphone", "smartphone", "refurbished"],
                seller: seller._id,
                status: "approved",
                approvedAt: new Date(),
                location: { city: "Mumbai", state: "Maharashtra" },
                isFeatured: true,
            });
            console.log(`Created product: ${product.title}`);
        } else {
            console.log(`Product already exists: ${existingProduct.title}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Seed script error:", error);
        process.exit(1);
    }
};

run();
