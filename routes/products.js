import { Router } from 'express';
import { getProducts, getProductById, addProduct, updateStock } from '../controllers/productController.js';

const router = Router();

router.get('/',           getProducts);
router.get('/:id',        getProductById);
router.post('/',          addProduct);
router.put('/:id/stock',  updateStock);

export default router;