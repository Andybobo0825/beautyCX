import { getDatabase } from '../dbconfig/database.js';

export function listProducts({ limit = 24, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 24, 1), 100);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  return getDatabase()
    .prepare(`
      SELECT
        p.pId,
        p.pName,
        p.brand,
        p.category,
        p.clickTimes,
        p.review,
        MIN(pn.storePrice) AS minPrice,
        MAX(pn.storePrice) AS maxPrice,
        mainPic.picId AS mainPictureId
      FROM Product p
      LEFT JOIN Price_Now pn ON pn.pId = p.pId
      LEFT JOIN Product_Picture mainPic ON mainPic.pId = p.pId AND mainPic.isMain = 1
      GROUP BY p.pId, p.pName, p.brand, p.category, p.clickTimes, p.review, mainPic.picId
      ORDER BY p.clickTimes DESC, p.pId ASC
      LIMIT ? OFFSET ?
    `)
    .all(safeLimit, safeOffset);
}

export function getProductById(productId) {
  const product = getDatabase()
    .prepare(`
      SELECT
        p.pId,
        p.pName,
        p.brand,
        p.category,
        p.clickTimes,
        p.review,
        MIN(pn.storePrice) AS minPrice,
        MAX(pn.storePrice) AS maxPrice
      FROM Product p
      LEFT JOIN Price_Now pn ON pn.pId = p.pId
      WHERE p.pId = ?
      GROUP BY p.pId, p.pName, p.brand, p.category, p.clickTimes, p.review
    `)
    .get(productId);

  if (!product) return null;

  const prices = getDatabase()
    .prepare(`
      SELECT store, storePrice, storeDiscount, storeLink, status, updateTime
      FROM Price_Now
      WHERE pId = ?
      ORDER BY store ASC
    `)
    .all(productId);

  const reviews = getDatabase()
    .prepare(`
      SELECT userName, date, rating, reviewText
      FROM Good_Review
      WHERE pId = ?
      ORDER BY date DESC
    `)
    .all(productId);

  const pictures = getDatabase()
    .prepare(`
      SELECT picId, isMain, storage_key, visibility, width, height, file_extension, updateTime
      FROM Product_Picture
      WHERE pId = ?
      ORDER BY isMain DESC, picId ASC
    `)
    .all(productId);

  return { ...product, prices, reviews, pictures };
}

export function getProductPicture(pictureId) {
  return getDatabase()
    .prepare(`
      SELECT pic, file_extension
      FROM Product_Picture
      WHERE picId = ? AND pic IS NOT NULL
    `)
    .get(pictureId);
}

export function getPortfolioStats() {
  const db = getDatabase();
  return {
    products: db.prepare('SELECT COUNT(*) AS count FROM Product').get().count,
    clients: db.prepare('SELECT COUNT(*) AS count FROM Client').get().count,
    currentPrices: db.prepare('SELECT COUNT(*) AS count FROM Price_Now').get().count,
    priceHistory: db.prepare('SELECT COUNT(*) AS count FROM Price_History').get().count,
    reviews: db.prepare('SELECT COUNT(*) AS count FROM Good_Review').get().count,
    pictures: db.prepare('SELECT COUNT(*) AS count FROM Product_Picture').get().count
  };
}
