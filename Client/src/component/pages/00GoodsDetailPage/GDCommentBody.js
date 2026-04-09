import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./css/GDComment.css"
import { ImStarFull, ImStarEmpty, ImStarHalf } from "react-icons/im";

const renderStar = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const full = rating >= i;
        const half = rating >= i - 0.5 && rating < i;
        if (full) {
            stars.push(<span key={i} className="star"><ImStarFull /></span>);
        } else if (half) {
            stars.push(<span key={i} className="star"><ImStarHalf /></span>);
        } else {
            stars.push(<span key={i} className="star"><ImStarEmpty /></span>);
        }
    };
    return stars;
}

const GDCommentBody = () => {
    const location = useLocation();
    const [comments, setComments] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [filterRating, setFilterRating] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const pId = queryParams.get('pId'); 
        if (pId) {
            const url = `${process.env.REACT_APP_API_URL}/gooddetail/productReview/${pId}`;
            axios.get(url)
                .then(response => {
                    if (response.status === 200) {
                        const fetchedComments = response.data.results;
                        setComments(fetchedComments); // 更新評論列表

                        // 計算平均評分
                        if (fetchedComments.length > 0) {
                            const totalRating = fetchedComments.reduce((sum, comment) => sum + comment.rating, 0);
                            setAverageRating(totalRating / fetchedComments.length);
                        } else {
                            setAverageRating(0);
                        }
                    }
                })
                .catch(error => console.error("API 錯誤:", error));
        }
    }, [location.search]);

    const filteredComments = filterRating 
        ? comments.filter(comment => comment.rating === filterRating)
        : comments;

    return (
        <div className="GDComment">
            <div className="GDCommentTitle">商品評論</div> 
            <div className="GDCommentArea">
                <table className="GDCommentTable">
                    <thead className="GDCommentThead">
                        <tr>
                            <th className="GDCommentth">
                                <div className="GDCommentRateArea">
                                    <div className="GDCommentRate">{averageRating.toFixed(1)}/5</div> 
                                    <div className="GDCommentStar">{renderStar(averageRating)}</div>
                                </div>
                                <div className="GDCommentFilter">
                                    <div className="GDCommentFilterBotton">
                                        <button className={filterRating === null ? 'active' : ''} onClick={() => setFilterRating(null)}>全部</button>
                                        <button className={filterRating === 5 ? 'active' : ''} onClick={() => setFilterRating(5)}>5星</button>
                                        <button className={filterRating === 4 ? 'active' : ''} onClick={() => setFilterRating(4)}>4星</button>
                                        <button className={filterRating === 3 ? 'active' : ''} onClick={() => setFilterRating(3)}>3星</button>
                                        <button className={filterRating === 2 ? 'active' : ''} onClick={() => setFilterRating(2)}>2星</button>
                                        <button className={filterRating === 1 ? 'active' : ''} onClick={() => setFilterRating(1)}>1星</button>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="GDCommentBody">
                        {filteredComments.length > 0 ? (
                            filteredComments.map((comment, index) => (
                                <tr key={comment.pId + comment.userName + index}> 
                                    <td>
                                        <div className="GDCommentUser">
                                            <img src={require('./pic/ex1.png')} alt="用戶"
                                                style={{
                                                    width: "6vw",
                                                    height: "6vw",
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    flexShrink: 0,
                                                }} />
                                            
                                            {/* 將文字、內文、時間全部包在一起，以利寬度展開 */}
                                            <div className="GDCommentUserInfo">
                                                <div className="GDCommentUserName">{comment.userName}</div>
                                                <div className="GDCommentUserRate">
                                                    {renderStar(comment.rating)} 
                                                    <span className="GDCommentUserRScore">{comment.rating.toFixed(1)}</span>
                                                </div>
                                                
                                                {/* 評論內文 */}
                                                <div className="GDCommentUserComment">{comment.reviewText}</div>
                                                
                                                {/* 時間排在內文垂直下方，並在 CSS 中設為靠右 */}
                                                <div className="GDCommentUserCommentTime">
                                                    時間&nbsp;:&nbsp;{new Date(comment.date).toLocaleDateString()} 
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td style={{ textAlign: 'center', padding: '20px' }}>
                                    {comments.length === 0 && filterRating !== null ? "沒有符合篩選條件的評論。" : "暫無評論數據"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GDCommentBody;