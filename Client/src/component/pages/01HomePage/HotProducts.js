import { useContext, useEffect, useState } from "react";
import ProductCards from "./ProductCards";
import "./css/HomePage.css";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { SearchdataContext } from "../../../ContextAPI";
import { useNavigate } from "react-router-dom";
import { getProductPic, getBatchProductPics } from "../../util/util";

const HotProducts = () => {
  const [hotProducts, setHotProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10); // 預設顯示前 10 筆

  const { Searchdata, setSearchdata } = useContext(SearchdataContext);

  // 載入熱門商品（根據 limit 動態改變）
  const fetchProducts = async (limitVal) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/homepage/product?sort=clickTimes`
      );

      if (response.data && response.data.results) {
        const slicedData = response.data.results.slice(0, limitVal);

        // 1. 收集所有 ID
        const pIds = slicedData.map(p => p.pId);

        // 2. 批次取得圖片
        let picMap = {};
        if (pIds.length > 0) {
          picMap = await getBatchProductPics(pIds);
        }

        // 3. 組合資料
        const formatted = slicedData.map(p => ({
          Id: p.pId,
          Name: p.pName,
          Price: p.price_min,
          OriginalPrice: p.price_max,
          // 使用 MAP 查找圖片 URL
          Image: (picMap[p.pId] && picMap[p.pId].url) ? picMap[p.pId].url : "",
          Rating: p.review,
        }));

        setHotProducts(formatted);
      }
    } catch (e) {
      console.error("Fetch hot products failed", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(limit);
  }, [limit]);

  const handleViewAllProducts = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/goodpage/product?category=`)
      .then((res) => {
        setSearchdata(res.data); // 將所有商品數據存入 SearchdataContext
      })
      .catch((err) => {
        console.error("載入所有商品失敗:", err);
        setSearchdata([]);
      });
  };

  return (
    <div className="HotProducts">
      <hr className="HPDivider" />
      <h2 className="HPTitle">熱門商品</h2>

      {/* 下拉選單 */}
      <div className="HPDropdown">
        <label htmlFor="limitSelect">顯示筆數：</label>

        <select
          id="limitSelect"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={10}>前 10 筆</option>
          <option value={20}>前 20 筆</option>
          <option value={50}>前 50 筆</option>
          <option value={100}>前 100 筆</option>
        </select>
      </div>
      {/* 商品卡片 */}
      {loading ? (
        <div>載入中...</div>
      ) : (
        <div className="HPGrid">
          {hotProducts.map((p) => (
            <NavLink
              key={p.Id}
              to={`/GoodsDetailPage?pId=${p.Id}`}
              className="SRLink">
              <ProductCards Product={p} />
            </NavLink>
          ))}
        </div>
      )}

      <div className="HPButton">
        <NavLink to="/SearchResultPage?searchType=category&category=all">
          <button onClick={handleViewAllProducts}>查看所有商品</button>
        </NavLink>
      </div>
    </div>
  );
};

export default HotProducts;
