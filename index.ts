import  express from 'express';

import {config} from './config';
import { getOrder, createOrder, updateOrder } from './api';
import './services'; // Side-effect import


const app = express();

app.use(express.json());

app.post('/api/orders', createOrder);
app.get('/api/orders/:id', getOrder);
app.patch('/api/orders/:id', updateOrder);


app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});