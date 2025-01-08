

import pool from "../Config/database";

export class ProductModel {
  // Insert a new product into the database
  static async createProduct(name: string, price: number, stock: number, description: string) {
    const [result]: any = await pool.execute(
      "INSERT INTO products (name, price, stock, description) VALUES (?, ?, ?, ?)",
      [name, price, stock, description]
    );
    return result.insertId; // Return the newly created product ID
  }

  // Insert a product image into the database
  static async addProductImage(productId: number, imageUrl: string) {
    await pool.execute(
      "INSERT INTO productimages (productId, imageURL) VALUES (?, ?)",
      [productId, imageUrl]
    );
  }
}
