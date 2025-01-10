"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProduct = void 0;
const productModel_1 = require("../Models/productModel");
const cloudinaryConfig_1 = __importDefault(require("../Utils/cloudinaryConfig"));
const uploadProduct = async (req, res) => {
    try {
        const { name, price, stock, description } = req.body;
        // Validate required fields
        if (!name || !price || !stock || !description) {
            res.status(400).json({ error: "All fields are required (name, price, stock, description)." });
            return;
        }
        // Insert product data into the database
        const productId = await productModel_1.ProductModel.createProduct(name, price, stock, description);
        // Handle image uploads
        const files = req.files; // Ensure files are typed properly
        if (!files || files.length === 0) {
            res.status(400).json({ error: "At least one image is required." });
            return;
        }
        const uploadedImages = [];
        for (const file of files) {
            // Upload each image to Cloudinary
            const uploadResult = await cloudinaryConfig_1.default.uploader.upload(file.path, {
                folder: "products",
            });
            const imageUrl = uploadResult.secure_url;
            uploadedImages.push({ productId, imageUrl });
            // Save the image URL in the database
            await productModel_1.ProductModel.addProductImage(productId, imageUrl);
        }
        // Respond with success
        res.status(201).json({
            message: "Product uploaded successfully",
            product: {
                id: productId,
                name,
                price,
                stock,
                description,
                images: uploadedImages,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error uploading product" });
    }
};
exports.uploadProduct = uploadProduct;
//# sourceMappingURL=productController.js.map