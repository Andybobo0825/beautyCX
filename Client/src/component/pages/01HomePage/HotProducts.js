import { useContext, useEffect, useState } from "react";
import ProductCards from "./ProductCards";
import "./css/HomePage.css";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { SearchdataContext } from "../../../ContextAPI";
import { useNavigate } from "react-router-dom";
import { getProductPic } from "../../util/util";
const HotProducts = () => {
  const [hotProducts, setHotProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10); // 預設顯示前 10 筆

  const { Searchdata, setSearchdata } = useContext(SearchdataContext);

  // 載入熱門商品（根據 limit 動態改變）
  const fetchProducts = async (limitVal) => {
    setLoading(true);
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/homepage/product?sort=clickTimes`       //移除limit=${limitVal}
    ); 

    if (response.data) {
      const formatted = await Promise.all(
        response.data.results.slice(0, limitVal).map(async (p) => ({            //用limitVal更改顯示數量
          Id: p.pId,
          Name: p.pName,
          Price: p.price_min,
          OriginalPrice: p.price_max,
          Image: await getProductPic(p.pId), // ✅ 現在這裡 await 是有效的
          Rating: p.review,
        }))
      );
      setHotProducts(formatted);
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
