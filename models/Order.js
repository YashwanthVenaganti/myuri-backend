import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_name: { type: DataTypes.STRING(100), allowNull: false },
    customer_email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: { isEmail: true }
    },
    customer_phone: { type: DataTypes.STRING(20), allowNull: true },
    total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
  }, { tableName: 'orders', timestamps: true });

  return Order;
};