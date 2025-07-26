const axios = require('axios');

class LLMService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1';
    this.model = 'llama3-8b-8192'; // Fast and cost-effective model
  }

  async generateResponse(messages, context = '') {
    try {
      if (!this.apiKey) {
        throw new Error('GROQ_API_KEY not configured');
      }

      const systemPrompt = `You are a helpful customer support assistant for an e-commerce clothing website. 
You have access to the following context about the business:
${context}

Your role is to:
1. Help customers with product inquiries
2. Provide order status information
3. Answer questions about inventory and availability
4. Assist with general customer service queries
5. Ask clarifying questions when needed to provide accurate information

Always be polite, professional, and helpful. If you don't have enough information to answer a question accurately, ask for clarification.`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        content: response.data.choices[0].message.content,
        tokens_used: response.data.usage.total_tokens,
        model: this.model
      };
    } catch (error) {
      console.error('LLM API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate response from LLM');
    }
  }

  async queryDatabase(query, dbService) {
    try {
      // Extract key information from the query
      const lowerQuery = query.toLowerCase();
      
      // Check for different types of queries
      if (lowerQuery.includes('top') && lowerQuery.includes('sold')) {
        return await this.getTopSoldProducts(dbService);
      }
      
      if (lowerQuery.includes('order') && lowerQuery.includes('status')) {
        const orderId = this.extractOrderId(query);
        if (orderId) {
          return await this.getOrderStatus(orderId, dbService);
        }
      }
      
      if (lowerQuery.includes('stock') || lowerQuery.includes('inventory') || lowerQuery.includes('left')) {
        const productName = this.extractProductName(query);
        if (productName) {
          return await this.getProductStock(productName, dbService);
        }
      }
      
      if (lowerQuery.includes('product') || lowerQuery.includes('item')) {
        return await this.searchProducts(query, dbService);
      }
      
      // Default: return general information
      return await this.getGeneralInfo(dbService);
      
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Failed to query database');
    }
  }

  async getTopSoldProducts(dbService) {
    const result = await dbService.getTopSoldProducts(5);
    return {
      type: 'top_products',
      data: result,
      summary: `Here are the top 5 most sold products: ${result.map(p => p.name).join(', ')}`
    };
  }

  async getOrderStatus(orderId, dbService) {
    const result = await dbService.getOrderStatus(orderId);
    return {
      type: 'order_status',
      data: result,
      summary: result ? `Order ${orderId} status: ${result.status}` : `Order ${orderId} not found`
    };
  }

  async getProductStock(productName, dbService) {
    const result = await dbService.getProductStock(productName);
    return {
      type: 'product_stock',
      data: result,
      summary: result ? `${result.name}: ${result.available_stock} items in stock` : `Product not found`
    };
  }

  async searchProducts(query, dbService) {
    const result = await dbService.searchProducts(query);
    return {
      type: 'product_search',
      data: result,
      summary: `Found ${result.length} products matching your search`
    };
  }

  async getGeneralInfo(dbService) {
    const stats = await dbService.getGeneralStats();
    return {
      type: 'general_info',
      data: stats,
      summary: `We have ${stats.total_products} products, ${stats.total_orders} orders, and ${stats.available_stock} items in stock`
    };
  }

  extractOrderId(query) {
    const match = query.match(/order\s+(?:id\s+)?(\d+)/i);
    return match ? match[1] : null;
  }

  extractProductName(query) {
    // Simple extraction - in production, you'd want more sophisticated NLP
    const words = query.split(' ');
    const productIndex = words.findIndex(word => 
      ['stock', 'inventory', 'left', 'available'].includes(word.toLowerCase())
    );
    
    if (productIndex > 0) {
      return words.slice(0, productIndex).join(' ');
    }
    return null;
  }
}

module.exports = LLMService; 