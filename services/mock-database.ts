import {Product, CreateOrderInput, Order, OrderItem, OrderStatus} from '../api/types';
import {IDatabaseService} from './database';
import {IMessageBroker} from './message-broker';
import { UpdateOrderResult } from '../api/types';

export class LocalTestsDatabaseService implements IDatabaseService {
    private orders: Map<string, Order> = new Map();
    private products: Map<string, Product> = new Map();
    private orderItems: Map<string, OrderItem[]> = new Map();

    constructor() {
        // Seed with initial products
        this.products.set('1', {id: '1', name: 'Check Point Quantum Spark 1530', unitPrice: 1000});
        this.products.set('2', {id: '2', name: 'Check Point 2200 Appliance', unitPrice: 2000});
        this.products.set('3', {id: '3', name: 'Check Point 7000 Series Gateways', unitPrice: 3000});
    }

    createOrder(input: CreateOrderInput, messageBroker: IMessageBroker): Promise<Order | null> {
        const orderId = `mock-order-${Date.now()}`;
        const order: Order = {
            id: orderId,
            customerId: input.customerId,
            createdAt: new Date().toISOString(),
        };

        this.orders.set(orderId, order);

        const items = input.items.map(item => ({
            id: `mock-item-${Date.now()}-${Math.random()}`,
            orderId,
            productId: item.productId,
            quantity: item.quantity,
        }));

        this.orderItems.set(orderId, items);
        return Promise.resolve(order);
    }

    getOrder(id: string): Order | null {
        return this.orders.get(id) || null;
    }

    updateOrder(id: string, status: OrderStatus): UpdateOrderResult {
        const order = this.orders.get(id);

        return null;
    }

    getProductsByIds(ids: string[]): Product[] {
        return Array.from(this.products.values());
    }


    getOrderItems(orderId: string): OrderItem[] {
        return this.orderItems.get(orderId) || [];
    }
}