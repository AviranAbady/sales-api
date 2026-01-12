import type {Request, Response} from 'express';
import {CreateOrderRequestSchema, UpdateOrderStatusRequestSchema, OrderStatusSchema} from './types';
import {db, availabilityService, messageBroker} from '../services';

export const createOrder = async (req: Request, res: Response) => {

    // for simplicity, we assume authorization was prior to this handler
    // and we get the userId from the header
    // in a real-world application, we would use a JWT token middlware to verify the token
    // check roles and permissions, etc.

    const userId = req.header('userId');
    if (!userId) {
        res.status(401).json({
            message: 'Missing userId header'
        });
        return;
    }

    // validate request body
    const requestBody = CreateOrderRequestSchema.safeParse(req.body);
    
    if (!requestBody.success) {
        res.status(400).json({message: 'Invalid request body'});
        return;
    }

    // validate product ids
    const products = db.getProductsByIds(requestBody.data.items.map(item => item.productId));
    const allProductsValid = requestBody.data.items.length === products.length;

    if (!allProductsValid) {
        res.status(400).json({
            message: 'One or more invalid item ids',
        });
        return;
    }

    // validate item availability (id and quantity)
    const isAvailable = await availabilityService.check(requestBody.data.items);
    if (!isAvailable) {
        res.status(400).json({
            message: 'Items are not available',
        });
        return;
    }

    // Extract unit price for each item, allowing products with price of zero.
    // In order to save current price of item as part of the order (global item prices change)
    const itemsWithPrice = requestBody.data.items.map(item => ({
        ...item,
        unitPrice: products.find(p => p.id === item.productId)?.unitPrice || 0
    }))

    // Create order in database and publish to message broker
    // record will be commited to DB after the message is published successfully
    const order = await db.createOrder({customerId: userId, items: itemsWithPrice}, messageBroker);
    if (!order) {
        res.status(500).json({
            message: 'Failed to create order',
        });
        return;
    }

    res.status(201).json({
        orderId: order.id,
        status: OrderStatusSchema.enum.PENDING_SHIPMENT,
    });
};

interface OrderParams {
    id: string;
}

export const getOrder = (req: Request<OrderParams>, res: Response) => {
    const {id} = req.params;

    const userId = req.header('userId');
    if (!userId) {
        res.status(401).json({
            message: 'Missing userId header'
        });
        return;
    }

    // Get order by Id and validte it belongs to userId
    const order = db.getOrder(id);
    if (!order || order.customerId !== userId) {
        res.status(404).json({
            message: 'Order not found'
        });
        return;
    }

    const items = db.getOrderItems(id);
    if (!items) {
        res.status(500).json({
            message: 'Items not found'
        });
        return;
    }

    res.json({...order, items});
};

// This is an optional internal API for updating message shipping status
// Will not force order of shipping status, for example will allow updates from delivered to pending
export const updateOrder = (req: Request<OrderParams>, res: Response) => {
    const {id} = req.params;

    const requestBody = UpdateOrderStatusRequestSchema.safeParse(req.body);

    // validate request body
    if (!requestBody.success) {
        res.status(400).json({
            message: 'Invalid request body'
        });
        return;
    }

    // Find order
    const order = db.getOrder(id);
    if (!order) {
        res.status(404).json({
            message: 'Order not found'
        });
        return;
    }

    // Update shipping status
    const result = db.updateOrder(id, requestBody.data.status)
    if(!result) {
        res.status(500).json({
            message: 'Failed updating status'
        });
    }

    res.json(result);
};
  