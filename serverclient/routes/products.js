import { Router } from 'express';
import { getPortfolioStats, getProductById, getProductPicture, listProducts } from '../services/products.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ data: listProducts(req.query) });
});

router.get('/stats', (_req, res) => {
  res.json(getPortfolioStats());
});

router.get('/:productId', (req, res) => {
  const product = getProductById(req.params.productId);
  if (!product) {
    res.status(404).json({ error: 'product_not_found' });
    return;
  }

  res.json(product);
});

router.get('/:productId/pictures/:pictureId', (req, res) => {
  const picture = getProductPicture(req.params.pictureId);
  if (!picture) {
    res.status(404).json({ error: 'picture_not_found' });
    return;
  }

  const extension = picture.file_extension || 'png';
  res.type(extension === 'jpg' ? 'jpeg' : extension);
  res.send(Buffer.from(picture.pic));
});

export default router;
