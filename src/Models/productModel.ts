

import pool from "../Config/database";
import {logger} from "../Core/logger"

export class ProductModel {
  // Insert a new product into the database
  static async createProduct(name: string, price: number, stock: number, description: string) {
    try {
      
      const [result]: any = await pool.execute(
        "INSERT INTO products (name, price, stock, description) VALUES (?, ?, ?, ?)",
        [name, price, stock, description]
      );
      return result.insertId; 
    } catch (error : any) {
       logger.error("Error Inserting a new product",error.message)
      throw new Error(error.message);
      
    }
    // logger.info("Inserting a new ")
  }

  // Insert a product image into the database
  static async addProductImage(productId: number, imageUrl: string) {
    try {
      
      await pool.execute(
        "INSERT INTO productimages (productId, imageURL) VALUES (?, ?)",
        [productId, imageUrl]
      )
    }
     catch (error : any) {
      logger.error("Error Inserting product Image")
    }
  }
}
