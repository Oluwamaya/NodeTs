import { Request, Response } from "express";
import { ProductModel } from "../Models/productModel";
import cloudinary from "../Utils/cloudinaryConfig";
import { logger } from "../Core/logger";

import { productValidationSchema } from "../Middleware/ValidationSchema";

// Joi validation schema


export const uploadProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = productValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      logger.warn("Validation Error", { errors: errorMessages });
      res.status(400).json({ error: "Validation error", details: errorMessages });
      return;
    }

    const { name, price, stock, description } = value;

    // Validate images
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: "At least one image is required." });
      return;
    }

    // Insert product data into the database
    const productId = await ProductModel.createProduct(name, price, stock, description);

    // Upload images to Cloudinary concurrently
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        const imageUrl = uploadResult.secure_url;

        // Save the image URL in the database
        await ProductModel.addProductImage(productId, imageUrl);

        return { productId, imageUrl };
      })
    );

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
  } catch (error: any) {
    logger.error("Error uploading product", { error: error.message });
    res.status(500).json({ error: "Error uploading product" });
  }
};
