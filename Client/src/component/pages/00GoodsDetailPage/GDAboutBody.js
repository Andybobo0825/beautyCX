import { useContext, useEffect, useState } from "react";
import ImageGallery from "react-image-gallery";
import { ImStarFull } from "react-icons/im";
import "react-image-gallery/styles/css/image-gallery.css";
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io";
import { MaskContext, ClientIdContext } from "../../../ContextAPI";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./css/GDAboutBody.css";
import GDHistoryCompare from "./GDPriceHistory";
import { getProductPic, getProductAllPic } from "../../util/util";

const GDAboutBody = () => {
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { setMask } = useContext(MaskContext);
  const { clientId } = useContext(ClientIdContext);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pId = queryParams.get("pId");

  // loading 狀態僅用於第一次抓取商品文字資料
  const [loading, setLoading] = useState(true);

  // 1. 抓取商品基本資料與圖片 URL (優化版：先顯示 UI，圖片後載入)
  const getProductData = async () => {
    if (!pId) return;
    setMask(true);

    try {
      // 1. 先抓文字資料 (速度快)
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/gooddetail/product/${pId}`
      );

      const pData = res.data.results;
      if (pData) {
        setProduct({
          Id: pData.pId,
          Name: pData.pName,
          Brand: pData.brand,
          Category: pData.category,
          Price: pData.price_min,
          OriginalPrice: pData.price_max,
          Rating: pData.review,
          ReviewCount: "(100+)", // 範例
        });
      }

      // 2. 獲取完文字後，先關閉 Mask，讓使用者看到文字界面
      setMask(false);
      setLoading(false);

      // 3. 非同步抓取圖片 (不會阻塞 UI)
      // 使用 util 中的 getProductAllPic
      const picUrls = await getProductAllPic(pId);

      // 轉換成 ImageGallery 格式
      if (picUrls && picUrls.length > 0) {
        const galleryImages = picUrls.map(url => ({
          original: url,
          thumbnail: url,
          originalClass: "custom-gallery-image", // 自訂 CSS 用
        }));
        setImages(galleryImages);
      } else {
        // Fallback placeholder
        setImages([{
          original: "https://via.placeholder.com/600x400?text=No+Image",
          thumbnail: "https://via.placeholder.com/150x100?text=No+Image"
        }]);
      }

      // 4. 打後端記錄點擊 (如果在 useEffect 做可能會重複，這裡只做一次)
      axios.post(`${process.env.REACT_APP_API_URL}/gooddetail/click/${pId}`)
        .catch(e => console.error("Click log failed", e));

    } catch (err) {
      console.error("載入商品失敗", err);
      // 發生錯誤也要確保 Mask 關閉
      setMask(false);
      setLoading(false);
    }
  };

  /** 檢查追蹤狀態與切換 */
  const toggleTrack = async () => {
    if (!clientId) {
      alert("請先登入會員");
      return;
    }
    setMask(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/gooddetail/track`,
        { pId: pId },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setIsTracking(res.data.status === 1);
        alert(res.data.message);
      }
    } catch (err) {
      console.error("追蹤操作失敗", err);
      alert("操作失敗，請稍後再試");
    }
    setMask(false);
  };

  // 檢查初始追蹤狀態 (可以跟 getProductData 平行執行)
  const checkTrackStatus = async () => {
    if (!clientId || !pId) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/client/checkTrack`, { pId });
      if (res.data && res.data.isTracking) {
        setIsTracking(true);
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    // 依賴改變時重新抓取
    getProductData();
    if (clientId) checkTrackStatus();
  }, [pId, clientId]);

  if (!product) {
    // 如果還沒拿到文字資料，顯示空白或簡單的 Loading
    return <div className="GDAboutBody"></div>;
  }

  return (
    <div className="GDAboutBody">
      {/* 左側圖片區 */}
      <div className="GDABLeft">
        <ImageGallery
          items={images}
          showPlayButton={false}
          showFullscreenButton={true}
          slideInterval={3000}
          slideOnThumbnailOver={true}
        />
      </div>

      {/* 右側資訊區 */}
      <div className="GDABRight">
        <div className="GDABBrand">{product.Brand}</div>
        <div className="GDABName">{product.Name}</div>

        <div className="GDABRating">
          <ImStarFull className="star-icon" />
          <span className="rating-score">{product.Rating}</span>
          <span className="review-count">{product.ReviewCount} 評論</span>
        </div>

        <div className="GDABPriceBlock">
          <span className="GDABOriginalPrice">
            NT$ {product.OriginalPrice}
          </span>
          <span className="GDABPrice">NT$ {product.Price}</span>
        </div>

        <div className="GDABButtons">
          <button
            className={`GDABTrackBtn ${isTracking ? "active" : ""}`}
            onClick={toggleTrack}>
            {isTracking ? "已追蹤" : "加入追蹤"}
          </button>
          <button
            className="GDABCompareBtn"
            onClick={() => setShowHistory(true)}>
            歷史價格 / 比價
          </button>
        </div>

        {/* 歷史價格 Modal */}
        <GDHistoryCompare
          pId={pId}
          productName={product.Name}
          brand={product.Brand}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />

        <div className="GDABExtraInfo">
          <p>運費：滿 $1000 免運</p>
          <p>付款方式：信用卡、貨到付款</p>
        </div>
      </div>
    </div>
  );
};

export default GDAboutBody;
