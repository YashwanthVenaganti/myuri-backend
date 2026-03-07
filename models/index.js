import { sequelize } from '../config/db.js';   // ← named import
import { DataTypes } from 'sequelize';
import defineProduct from './Product.js';
import defineOrder from './Order.js';

const Product = defineProduct(sequelize);
const Order   = defineOrder(sequelize);

const OrderItem = sequelize.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 }
  },
  price_at_purchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, { tableName: 'order_items', timestamps: false });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

export { sequelize, Product, Order, OrderItem };