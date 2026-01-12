import {z} from 'zod';

export const OrderStatusSchema = z.enum([
    'PENDING_SHIPMENT',
    'SHIPPED',
    'DELIVERED'
]);

export const CreateOrderRequestSchema = z.object({
    items: z.array(
        z.object({
            productId: z.uuid(),
            quantity: z.number().min(1)
        })
    ).min(1).max(10)

});

export const UpdateOrderStatusRequestSchema = z.object({
    status: OrderStatusSchema
});

export type Product = {
    id: string;
    name: string;
    unitPrice: number;
};

export type Order = {
    id: string;
    customerId: string;
    createdAt: string;
};

export type OrderItem = {
    orderId: string;
    productId: string;
    quantity: number;
};

export type CreateOrderInput = {
    customerId: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
};

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export type UpdateOrderResult = { id: string, status: string } | null; 