const { Op, sequelize } = require('sequelize');
const { Product, Order, OrderItem, InventoryItem, User, DistributionCenter } = require('../models');

class DatabaseService {
  async getTopSoldProducts(limit = 5) {
    try {
      const result = await OrderItem.findAll({
        attributes: [
          'product_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'sales_count']
        ],
        include: [{
          model: Product,
          attributes: ['name', 'brand', 'category', 'retail_price']
        }],
        group: ['product_id'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: limit
      });

      return result.map(item => ({
        product_id: item.product_id,
        name: item.Product.name,
        brand: item.Product.brand,
        category: item.Product.category,
        price: item.Product.retail_price,
        sales_count: parseInt(item.dataValues.sales_count)
      }));
    } catch (error) {
      console.error('Error getting top sold products:', error);
      throw error;
    }
  }

  async getOrderStatus(orderId) {
    try {
      const order = await Order.findOne({
        where: { order_id: orderId },
        include: [{
          model: OrderItem,
          include: [{
            model: Product,
            attributes: ['name', 'brand']
          }]
        }]
      });

      if (!order) return null;

      return {
        order_id: order.order_id,
        status: order.status,
        created_at: order.created_at,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
        returned_at: order.returned_at,
        num_of_item: order.num_of_item,
        total_amount: order.total_amount,
        items: order.OrderItems.map(item => ({
          product_name: item.Product.name,
          product_brand: item.Product.brand,
          status: item.status,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };
    } catch (error) {
      console.error('Error getting order status:', error);
      throw error;
    }
  }

  async getProductStock(productName) {
    try {
      const product = await Product.findOne({
        where: {
          name: {
            [Op.iLike]: `%${productName}%`
          }
        },
        include: [{
          model: InventoryItem,
          where: { status: 'available' },
          required: false
        }]
      });

      if (!product) return null;

      const availableStock = product.InventoryItems.length;

      return {
        product_id: product.product_id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        retail_price: product.retail_price,
        available_stock: availableStock,
        sku: product.sku
      };
    } catch (error) {
      console.error('Error getting product stock:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      const products = await Product.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { brand: { [Op.iLike]: `%${query}%` } },
            { category: { [Op.iLike]: `%${query}%` } },
            { department: { [Op.iLike]: `%${query}%` } }
          ]
        },
        include: [{
          model: InventoryItem,
          where: { status: 'available' },
          required: false
        }],
        limit: 10
      });

      return products.map(product => ({
        product_id: product.product_id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        department: product.department,
        retail_price: product.retail_price,
        available_stock: product.InventoryItems.length,
        sku: product.sku
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async getGeneralStats() {
    try {
      const [
        totalProducts,
        totalOrders,
        availableStock,
        totalUsers
      ] = await Promise.all([
        Product.count(),
        Order.count(),
        InventoryItem.count({ where: { status: 'available' } }),
        User.count()
      ]);

      return {
        total_products: totalProducts,
        total_orders: totalOrders,
        available_stock: availableStock,
        total_users: totalUsers
      };
    } catch (error) {
      console.error('Error getting general stats:', error);
      throw error;
    }
  }

  async getProductCategories() {
    try {
      const categories = await Product.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'product_count']
        ],
        group: ['category'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
      });

      return categories.map(cat => ({
        category: cat.category,
        product_count: parseInt(cat.dataValues.product_count)
      }));
    } catch (error) {
      console.error('Error getting product categories:', error);
      throw error;
    }
  }

  async getBrands() {
    try {
      const brands = await Product.findAll({
        attributes: [
          'brand',
          [sequelize.fn('COUNT', sequelize.col('id')), 'product_count']
        ],
        group: ['brand'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10
      });

      return brands.map(brand => ({
        brand: brand.brand,
        product_count: parseInt(brand.dataValues.product_count)
      }));
    } catch (error) {
      console.error('Error getting brands:', error);
      throw error;
    }
  }

  async getRecentOrders(limit = 5) {
    try {
      const orders = await Order.findAll({
        order: [['created_at', 'DESC']],
        limit: limit,
        include: [{
          model: OrderItem,
          include: [{
            model: Product,
            attributes: ['name', 'brand']
          }]
        }]
      });

      return orders.map(order => ({
        order_id: order.order_id,
        status: order.status,
        created_at: order.created_at,
        num_of_item: order.num_of_item,
        total_amount: order.total_amount,
        items: order.OrderItems.map(item => ({
          product_name: item.Product.name,
          product_brand: item.Product.brand,
          quantity: item.quantity
        }))
      }));
    } catch (error) {
      console.error('Error getting recent orders:', error);
      throw error;
    }
  }
}

module.exports = DatabaseService; 