import styles from "./css/ChasingPage.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import ex1 from './pic/ex1.png';
import { useEffect, useCallback, useState, useContext } from "react";
import axios from "axios";
import { getProductPic } from "../../util/util";
import { MaskContext } from "../../../ContextAPI";

const ChasingBody = () => {
    const navigate = useNavigate();
    const { setMask } = useContext(MaskContext);
    const [trackList, setTrackList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrackList = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        const url = `${process.env.REACT_APP_API_URL}/clientPage/trackList`;

        if (!token) {
            navigate('/LoginPage');
            return;
        }

        setMask(true);
        setLoading(true);
        try {
            const response = await axios.get(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response?.data?.results?.length > 0) {
                const formatted = await Promise.all(
                    response.data.results.map(async item => ({
                        ...item,
                        image: await getProductPic(item.pId)
                    }))
                );
                setTrackList(formatted);
            } else {
                setTrackList([]);
            }
        } catch (error) {
            console.error("取得追蹤商品列表失敗:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('accessToken');
                navigate('/LoginPage');
            }
        } finally {
            setLoading(false);
            setMask(false);
        }
    }, [navigate, setMask]);

    useEffect(() => {
        fetchTrackList();
    }, [fetchTrackList]);

    const handleToggleTrack = async (pId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) { navigate('/LoginPage'); return; }

        setMask(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/clientPage/track`,
                { pId: pId },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

            alert(`${response.data.message || '操作成功'}`);
            fetchTrackList();
        } catch (error) {
            alert(`操作失敗: ${error.response?.data?.message || error.message}`);
        } finally {
            setMask(false);
        }
    };

    return (
        <div className={styles.ChasingBody}>
            <div className={styles.SettingNav}>
                <NavLink to="/SettingPage">
                    <button className={styles.SBIASettingButtom}>個人設定</button>
                </NavLink>
                <NavLink to="/ChasingPage">
                    <button className={styles.SBIAFollowButtom}>追蹤商品</button>
                </NavLink>
            </div>

            <hr className={styles["Chr-line"]} />

            {!loading && (
                trackList.length > 0 ? (
                    trackList.map((product) => (
                        <div className={styles.CBInputArea} key={product.pId}>
                            <NavLink to={`/GoodsDetailPage?pId=${product.pId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className={styles["product-card"]} >

                                    <img src={product.image || ex1} alt={product.pName} className={styles["product-image"]} />

                                    <div className={styles["product-info"]}>
                                        <div className={styles["product-brand"]}>{product.brand}</div>
                                        <div className={styles["product-name"]}>{product.pName}</div>
                                        <div className={styles["product-price"]}>
                                            <span className={styles["current-price"]}>目前價格: ${product.price_min ? product.price_min.toFixed(2) : 'N/A'}</span>
                                        </div>
                                        <div className={styles["product-rating"]}>⭐{product.review}</div>
                                    </div>

                                </div>
                            </NavLink>
                            <button
                                className={styles.CBIAUnfollowButtom}
                                onClick={() => handleToggleTrack(product.pId)}
                            >
                                取消追蹤
                            </button>

                        </div>
                    ))
                ) : (
                    <div className={styles.CBInputArea}>
                        <div className={styles["no-tracking-data"]}>目前沒有追蹤任何商品。</div>
                    </div>
                )
            )}
        </div>
    );
};

export default ChasingBody;