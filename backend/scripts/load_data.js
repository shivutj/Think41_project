const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { sequelize, DistributionCenter, Product, User, Order, OrderItem, InventoryItem } = require('../models');

async function loadData() {
  try {
    console.log('🔄 Starting data loading process...');
    
    // Sync database
    await sequelize.sync({ force: true, alter: true });
    console.log('✅ Database synced');

    const dataPath = path.join(__dirname, '../../ecommerce-dataset/archive');

    // Load Distribution Centers
    console.log('📦 Loading distribution centers...');
    const distributionCenters = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(dataPath, 'distribution_centers.csv'))
        .pipe(csv())
        .on('data', (row) => {
          distributionCenters.push({
            center_id: row.id,
            name: row.name,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude)
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    await DistributionCenter.bulkCreate(distributionCenters);
    console.log(`✅ Loaded ${distributionCenters.length} distribution centers`);

    // Load Products
    console.log('🛍️ Loading products...');
    const products = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(dataPath, 'products.csv'))
        .pipe(csv())
        .on('data', (row) => {
          products.push({
            product_id: row.id,
            name: row.name,
            brand: row.brand,
            category: row.category,
            department: row.department,
            sku: row.sku,
            cost: parseFloat(row.cost),
            retail_price: parseFloat(row.retail_price),
            distribution_center_id: parseInt(row.distribution_center_id)
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    await Product.bulkCreate(products);
    console.log(`✅ Loaded ${products.length} products`);

    // Load Users (sample for performance)
    console.log('👥 Loading users (sample)...');
    const users = [];
    const seenEmails = new Set();
    let userCount = 0;
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(dataPath, 'users.csv'))
        .pipe(csv())
        .on('data', (row) => {
          if (userCount < 1000 && !seenEmails.has(row.email)) { // Load only first 1000 unique users
            seenEmails.add(row.email);
            users.push({
              user_id: `user_${row.id}`,
              email: row.email,
              password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ6Kz6O', // Default password: password123
              name: `${row.first_name} ${row.last_name}`,
              preferences: {
                age: parseInt(row.age),
                gender: row.gender,
                state: row.state,
                city: row.city,
                country: row.country
              }
            });
            userCount++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    await User.bulkCreate(users);
    console.log(`✅ Loaded ${users.length} users`);

    // Load Orders (sample) - only for users we have
    console.log('📋 Loading orders (sample)...');
    const orders = [];
    const validUserIds = new Set(users.map(u => parseInt(u.user_id.replace('user_', ''))));
    let orderCount = 0;
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(dataPath, 'orders.csv'))
        .pipe(csv())
        .on('data', (row) => {
          const userId = parseInt(row.user_id);
          if (orderCount < 5000 && validUserIds.has(userId)) { // Load only orders for valid users
            orders.push({
              order_id: row.order_id,
              csv_user_id: userId, // Store the CSV user ID for later mapping
              status: row.status,
              gender: row.gender,
              num_of_item: parseInt(row.num_of_item),
              total_amount: 0, // Will be calculated from order items
              shipped_at: row.shipped_at ? new Date(row.shipped_at) : null,
              delivered_at: row.delivered_at ? new Date(row.delivered_at) : null,
              returned_at: row.returned_at ? new Date(row.returned_at) : null
            });
            orderCount++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    // Now map the CSV user IDs to database user IDs
    const dbUsers = await User.findAll();
    const userMapping = {};
    dbUsers.forEach(dbUser => {
      const csvUserId = parseInt(dbUser.user_id.replace('user_', ''));
      userMapping[csvUserId] = dbUser.id;
    });
    
    // Update orders with correct user IDs
    const ordersWithDbIds = orders.map(order => ({
      ...order,
      user_id: userMapping[order.csv_user_id],
      csv_user_id: undefined // Remove the temporary field
    })).filter(order => order.user_id); // Only include orders with valid user IDs
    
    await Order.bulkCreate(ordersWithDbIds);
    console.log(`✅ Loaded ${ordersWithDbIds.length} orders`);

    // Load Inventory Items (sample)
    console.log('📦 Loading inventory items (sample)...');
    const inventoryItems = [];
    let inventoryCount = 0;
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(dataPath, 'inventory_items.csv'))
        .pipe(csv())
        .on('data', (row) => {
          if (inventoryCount < 10000) { // Load only first 10000 items
            inventoryItems.push({
              inventory_id: row.id,
              product_id: parseInt(row.product_id),
              cost: parseFloat(row.cost),
              status: row.sold_at ? 'sold' : 'available',
              sold_at: row.sold_at ? new Date(row.sold_at) : null
            });
            inventoryCount++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    await InventoryItem.bulkCreate(inventoryItems);
    console.log(`✅ Loaded ${inventoryItems.length} inventory items`);

    // Load Order Items (sample) - only for orders we have
    console.log('🛒 Loading order items (sample)...');
    const orderItems = [];
    const validOrderIds = new Set(ordersWithDbIds.map(o => o.order_id));
    const validOrderItemUserIds = new Set(users.map(u => parseInt(u.user_id.replace('user_', ''))));
    const validOrderItemProductIds = new Set(products.map(p => p.product_id));
    let orderItemCount = 0;
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(dataPath, 'order_items.csv'))
        .pipe(csv())
        .on('data', (row) => {
          const orderId = row.order_id;
          const userId = parseInt(row.user_id);
          const productId = parseInt(row.product_id);
          if (orderItemCount < 10000 && 
              validOrderIds.has(orderId) && 
              validOrderItemUserIds.has(userId) && 
              validOrderItemProductIds.has(productId)) { // Load only order items for valid orders, users, and products
            orderItems.push({
              order_item_id: row.id,
              csv_order_id: orderId, // Store the CSV order ID for later mapping
              user_id: userId,
              product_id: productId,
              inventory_item_id: parseInt(row.inventory_item_id),
              status: row.status,
              quantity: 1,
              unit_price: 0, // Will be set from product
              total_price: 0, // Will be calculated
              shipped_at: row.shipped_at ? new Date(row.shipped_at) : null,
              delivered_at: row.delivered_at ? new Date(row.delivered_at) : null,
              returned_at: row.returned_at ? new Date(row.returned_at) : null
            });
            orderItemCount++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    // Now map the CSV order IDs to database order IDs
    const dbOrders = await Order.findAll();
    const orderMapping = {};
    dbOrders.forEach(dbOrder => {
      orderMapping[dbOrder.order_id] = dbOrder.id;
    });
    
    // Update order items with correct order IDs
    const orderItemsWithDbIds = orderItems.map(item => ({
      ...item,
      order_id: orderMapping[item.csv_order_id],
      csv_order_id: undefined // Remove the temporary field
    })).filter(item => item.order_id); // Only include items with valid order IDs
    
    await OrderItem.bulkCreate(orderItemsWithDbIds);
    console.log(`✅ Loaded ${orderItemsWithDbIds.length} order items`);

    console.log('🎉 Data loading completed successfully!');
    console.log('📊 Database Summary:');
    console.log(`   - Distribution Centers: ${distributionCenters.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Orders: ${ordersWithDbIds.length}`);
    console.log(`   - Inventory Items: ${inventoryItems.length}`);
    console.log(`   - Order Items: ${orderItemsWithDbIds ? orderItemsWithDbIds.length : 0}`);

  } catch (error) {
    console.error('❌ Error loading data:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

loadData(); 