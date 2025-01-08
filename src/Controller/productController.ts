import { Request, Response } from "express";
import { ProductModel } from "../Models/productModel";
import cloudinary from "../Utils/cloudinaryConfig";
import { upload } from "../Utils/multer";

export const uploadProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, stock, description } = req.body;

    // Validate required fields
    if (!name || !price || !stock || !description) {
      res.status(400).json({ error: "All fields are required (name, price, stock, description)." });
      return;
    }

    // Insert product data into the database
    const productId = await ProductModel.createProduct(name, price, stock, description);

    // Handle image uploads
    const files = req.files as Express.Multer.File[]; // Ensure files are typed properly
    if (!files || files.length === 0) {
      res.status(400).json({ error: "At least one image is required." });
      return;
    }

    const uploadedImages = [];
    for (const file of files) {
      // Upload each image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });

      const imageUrl = uploadResult.secure_url;
      uploadedImages.push({ productId, imageUrl });

      // Save the image URL in the database
      await ProductModel.addProductImage(productId, imageUrl);
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
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Error uploading product" });
  }
};

