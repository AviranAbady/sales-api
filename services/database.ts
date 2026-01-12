import Database from 'better-sqlite3';
import {randomUUID} from 'crypto';
import {Product, CreateOrderInput, Order, OrderItem, OrderStatusSchema, OrderStatus, UpdateOrderResult} from '../api/types';
import {IMessageBroker} from './message-broker';

export interface IDatabaseService {
    createOrder(input: CreateOrderInput, messageBroker: IMessageBroker): Promise<Order | null>;
    getOrder(id: string): Order | null;
    updateOrder(id: string, status: OrderStatus): UpdateOrderResult;
    getProductsByIds(ids: string[]): Product[];
    getOrderItems(orderId: string): OrderItem[];
}

export class DatabaseService implements IDatabaseService {
    private db: Database.Database;

    constructor() {
        this.db = this.initDatabase();
    }

    private initDatabase(): Database.Database {
        try {
            const db = new Database(':memory:');
            db.exec(`
                    CREATE TABLE IF NOT EXISTS orders (
                      id TEXT PRIMARY KEY,
                      customerId TEXT NOT NULL,
                      status TEXT NOT NULL,
                      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
                    );
            
                    CREATE TABLE IF NOT EXISTS order_items (
                      id TEXT PRIMARY KEY,
                      orderId TEXT NOT NULL,
                      productId TEXT NOT NULL,
                      quantity INTEGER NOT NULL,
                      unitPrice REAL NOT NULL,
                      FOREIGN KEY (orderId) REFERENCES orders(id),
                      FOREIGN KEY (productId) REFERENCES products(id)
                    );
            
                    CREATE TABLE IF NOT EXISTS products (
                      id TEXT PRIMARY KEY,
                      name TEXT NOT NULL,
                      unitPrice REAL NOT NULL
                    );
            
                    INSERT INTO products (id, name, unitPrice) 
                    VALUES 
                      (
                        'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
                        'Check Point Quantum Spark 1530', 
                        1000
                      );
            
                    INSERT INTO products (id, name, unitPrice) 
                    VALUES 
                      (
                        '9b3f8e7a-4d2c-4a1e-9f5b-8c6d3e2a1b0c', 
                        'Check Point 2200 Appliance',
                        2000
                      );
            
                    INSERT INTO products (id, name, unitPrice) 
                    VALUES 
                      (
                        '2e9f6a8b-7c5d-4e3f-a1b2-9d8c7b6a5e4f', 
                        'Check Point 7000 Series Gateways', 
                        3000
                      );`
            );

            console.log('Database initialized successfully');
            return db;
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    async createOrder(input: CreateOrderInput, messageBroker: IMessageBroker): Promise<Order | null> {
        const orderId = randomUUID();
        const createdAt = new Date().toISOString();

        try {
            // Manually begin transaction
            this.db.prepare('BEGIN').run();

            // Insert order
            const insertOrder = this.db.prepare(
                'INSERT INTO orders (id, customerId, status, createdAt) VALUES (?, ?, ?, ?)'
            );

            insertOrder.run(orderId, input.customerId, OrderStatusSchema.enum.PENDING_SHIPMENT, createdAt);

            // Insert order items
            const insertItem = this.db.prepare(
                'INSERT INTO order_items (id, orderId, productId, quantity, unitPrice) VALUES (?, ?, ?, ?, ?)'
            );
            for (const item of input.items) {
                insertItem.run(randomUUID(), orderId, item.productId, item.quantity, item.unitPrice);
            }

            // Now publish event with the order ID (still inside transaction)
            const isPublished = await messageBroker.publish('order-created', {orderId});
            if (!isPublished) {
                throw new Error('Failed to publish order created event');
            }

            // Commit transaction
            this.db.prepare('COMMIT').run();
            return {id: orderId, customerId: input.customerId, createdAt};

        } catch (error) {
            // Rollback on any error
            console.error('Error creating order:', error);
            this.db.prepare('ROLLBACK').run();
            return null
        }
    }

    getOrder(id: string): Order | null {
        const query = this.db.prepare('SELECT * FROM orders WHERE id = ?');
        return query.get(id) as Order | null;
    }

    updateOrder(id: string, status: OrderStatus): UpdateOrderResult {
        const query = this.db.prepare(
            'UPDATE orders SET status = ? WHERE id = ?'
        );
        const result = query.run(status, id);

        if (result.changes === 0) {
            return null;
        }

        return {id, status};
    }

    getProductsByIds(ids: string[]): Product[] {
        if (ids.length === 0) {
            return [];
        }

        const placeholders = ids.map(() => '?').join(',');
        const query = this.db.prepare(`SELECT *
                                       FROM products
                                       WHERE id IN (${placeholders})`);
        return query.all(...ids) as Product[];
    }


    getOrderItems(orderId: string): OrderItem[] {
        const query = this.db.prepare('SELECT * FROM order_items WHERE orderId = ?');
        return query.all(orderId) as OrderItem[];
    }
}

