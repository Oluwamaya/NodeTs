"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const database_1 = __importDefault(require("../Config/database"));
class ProductModel {
    // Insert a new product into the database
    static async createProduct(name, price, stock, description) {
        const [result] = await database_1.default.execute("INSERT INTO products (name, price, stock, description) VALUES (?, ?, ?, ?)", [name, price, stock, description]);
        return result.insertId; // Return the newly created product ID
    }
    // Insert a product image into the database
    static async addProductImage(productId, imageUrl) {
        await database_1.default.execute("INSERT INTO productimages (productId, imageURL) VALUES (?, ?)", [productId, imageUrl]);
    }
}
exports.ProductModel = ProductModel;
//# sourceMappingURL=productModel.js.map