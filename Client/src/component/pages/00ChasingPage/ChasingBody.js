import "./css/ChasingPage.css";
import { NavLink, useNavigate } from "react-router-dom";
import ex1 from './pic/ex1.png'; // 根據你的位置調整路徑
import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { getProductPic } from "../../util/util";

const ChasingBody = () => {

    const navigate = useNavigate();
    const [trackList, setTrackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 獲取追蹤列表的邏輯 (不變)
    const fetchTrackList = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        const url = `${process.env.REACT_APP_API_URL}/clientPage/trackList`;

        if (!token) {
            alert("請先登入以查看追蹤商品。");
            navigate('/LoginPage');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(url, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            console.log(response.data.results);

            if (response?.data?.results?.length > 0) {
                const formatted = await Promise.all(
                    response.data.results.map(async item => ({
                        ...item,
                        image: await getProductPic(item.pId)
                    }))
                );

                setTrackList(formatted);
            }
        } catch (error) {
            console.error("取得追蹤商品列表失敗:", error);
            setError("無法載入追蹤商品列表，請稍後再試。");

            if (error.response) {
                if (error.response.status === 401) {
                    alert("您的登入已過期，請重新登入。");
                    localStorage.removeItem('accessToken');
                    navigate('/LoginPage');
                } else if (error.response.data && error.response.data.error) {
                    alert(`取得追蹤商品列表失敗: ${error.response.data.error}`);
                } else {
                    alert(`取得追蹤商品列表失敗: ${error.response.status} - ${error.response.statusText}`);
                }
            } else if (error.request) {
                alert("網路錯誤，請檢查您的連線。");
            } else {
                alert(`請求設定錯誤或未知錯誤: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchTrackList();
    }, [fetchTrackList]);


    // handleToggleTrack - 用於切換 (新增/取消) 追蹤狀態
    // 這個函式會呼叫您提供的 POST /clientPage/track API
    const handleToggleTrack = async (pId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("請先登入以操作追蹤狀態。");
            navigate('/LoginPage');
            return;
        }

        const toggleUrl = `${process.env.REACT_APP_API_URL}/clientPage/track`; // 呼叫 POST /clientPage/track

        try {
            const response = await axios.post(toggleUrl, { pId: pId }, { // 傳遞 pId 在請求體中
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            // 根據後端返回的 message 或 status 判斷是新增還是取消
            alert(`${response.data.message || '操作成功'}`);
            console.log("追蹤狀態切換成功響應:", response.data);

            // 操作成功後，重新獲取列表，更新 UI
            fetchTrackList();

        } catch (error) {
            console.error("追蹤狀態切換失敗:", error);
            alert(`追蹤狀態切換失敗: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('accessToken');
                navigate('/LoginPage');
            }
        }
    };


    if (loading) {
        return (
            <div className="ChasingBody">
                <div className="loading-message">載入中，請稍候...</div>
            </div>
        );
    }

    return (
        <div className="ChasingBody">
            <div style={{ display: "flex", gap: "0.5vw" }}>
                <NavLink to="/SettingPage">
                    <button className="CBIASettingButtom">設定</button>
                </NavLink>
                <NavLink to="/ChasingPage">
                    <button className="CBIAFollowButtom">追蹤商品</button>
                </NavLink>
            </div>

            <hr className="Chr-line" />

            {trackList.length > 0 ? (
                trackList.map((product) => (
                    // 將整個 CBInputArea 和其內容放在 map 內部
                    // 注意：這裡的 key 應該放在最外層的重複元素上，所以放在 CBInputArea 上
                    <div className="CBInputArea" key={product.pId}>
                        <div className="product-card">
                            {/* 商品圖片 */}
                            <img src={product.image || ex1} alt={product.pName} className="product-image" />

                            {/* 商品資訊區塊 */}
                            <div className="product-info">
                                <div className="product-brand">{product.brand}</div>
                                <div className="product-name">{product.pName}</div>
                                <div className="product-price">
                                    <span className="current-price">目前價格: ${product.price_min ? product.price_min.toFixed(2) : 'N/A'}</span>
                                </div>
                                <div className="product-rating">⭐{product.review}</div>
                            </div>

                            <button
                                className="CBIAUnfollowButtom"
                                onClick={() => handleToggleTrack(product.pId)}
                            >
                                取消追蹤
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                // 如果沒有追蹤商品，仍然顯示這個訊息在一個 CBInputArea 內 (非重複)
                <div className="CBInputArea">
                    <div className="no-tracking-data">目前沒有追蹤任何商品。</div>
                </div>
            )}
        </div>
    );
};

export default ChasingBody;
