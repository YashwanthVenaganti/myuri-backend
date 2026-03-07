import { sequelize, Order, OrderItem, Product } from '../models/index.js';

export const placeOrder = async (req, res) => {
  const { customer_name, customer_email, customer_phone, products } = req.body;

  // Validation
  if (!customer_name || !customer_email || !products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'customer_name, customer_email, and products[] are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer_email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  for (const item of products) {
    if (!item.product_id || !item.quantity || item.quantity < 1) {
      return res.status(400).json({ error: 'Each product must have a valid product_id and quantity >= 1' });
    }
  }

  const t = await sequelize.transaction();

  try {
    let total_amount = 0;
    const enrichedItems = [];

    for (const item of products) {
      const product = await Product.findByPk(item.product_id, {
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!product) {
        await t.rollback();
        return res.status(404).json({ error: `Product with id ${item.product_id} not found` });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          error: `Insufficient stock for "${product.product_name}". Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      await product.update({ stock: product.stock - item.quantity }, { transaction: t });

      total_amount += parseFloat(product.price) * item.quantity;

      enrichedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price_at_purchase: product.price,
      });
    }

    const order = await Order.create(
      { customer_name, customer_email, customer_phone: customer_phone || null, total_amount },
      { transaction: t }
    );

    const orderItems = await Promise.all(
      enrichedItems.map(item =>
        OrderItem.create({ ...item, orderId: order.id }, { transaction: t })
      )
    );

    await t.commit();

    res.status(201).json({ success: true, data: { order, items: orderItems } });

  } catch (err) {
    await t.rollback();
    console.error('placeOrder error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        include: [{ model: Product, attributes: ['id', 'product_name', 'category'] }]
      }]
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    console.error('getOrder error:', err);
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
};