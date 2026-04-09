// src/components/pages/SearchResult/SearchResult.js
/* eslint-disable react/style-prop-object */
import "./css/SearchResult.css";
import { useEffect, useState, useContext } from "react";
import Select from 'react-select';
import { ImStarFull } from "react-icons/im";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { getProductPic } from "../../util/util";
import { MaskContext } from "../../../ContextAPI";

const FixStyle = {
    position: "relative"
};


// 新增一個映射，將 URL 傳遞的英文鍵映射回後端所需的實際分類字串
const backendCategoryMap = {
    "all": "all", // "all" 保持不變
    "face_makeup": "化妝品_臉部彩妝",
    "eye_makeup": "化妝品_眼眉彩妝_眼影",
    "lip_makeup": "化妝品_唇部彩妝_唇膏",
    "cleansing": "臉部保養_卸妝_卸妝油&乳&水",
    "face_care": "臉部保養_保養"
};

const SearchResult = () => {

    const location = useLocation();
    /**原始DB資料 */
    const [originalData, setOriginalData] = useState([]);
    /**排序後資料 */
    const [filteredData, setFilteredData] = useState([]);
    const { setMask } = useContext(MaskContext);
    /**評論選項 */
    const [CommentSelectedOption, setCommentSelectedOption] = useState(null);
    /**價格選項 */
    const [PriceSelectedOption, setPriceSelectedOption] = useState(null);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');

    // 新增：圖片快取 map，避免每次 render 都重新抓
    const [imageMap, setImageMap] = useState({}); // 新增

    const CommentOptions = [
        { value: 'option0', label: '評論' },
        { value: 'option1', label: '評論：由高到低' },
        { value: 'option2', label: '評論：由低到高' }
    ];
    const PriceOptions = [
        { value: 'option3', label: '價格' },
        { value: 'option4', label: '價格：由高到低' },
        { value: 'option5', label: '價格：由低到高' }
    ];

    // 定義 Select 的樣式
    const selectOptionStyles = {
        menu: (provide) => ({
            ...provide,
            width: "14.5vw",
            marginTop: '0vw'
        }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'white',
            border: '0.15vw solid #ED8A8A',
            boxShadow: 'none',
            '&:hover': { borderColor: 'rgb(84, 49, 49)', },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '14vw',
            minWidth: '75px',
            height: '2.5vw',
            minHeight: '1.25vw',
            fontSize: '1.25vw',
            marginLeft: '0.5vw',
            marginRight: '0.5vw',
            marginTop: '0vw',
            borderRadius: '0.5vw'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? 'rgb(245, 183, 183)'
                : state.isFocused ? '#eee' : 'white',
            color: 'black',
            fontSize: '1.25vw',
            padding: '0.5vw',
        }),
        indicatorSeparator: (provided, state) => ({
            fontSize: '1.2vw',
            padding: 0,
            height: '50%',
            alignItems: 'center',
        }),
        valueContainer: (provided) => ({
            ...provided,
            margin: 0,
            padding: 0,
            fontSize: '1.2vw',
            alignItems: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            padding: 0,
            fontSize: "1vw"
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: "0 0.5vw 0 0",
            svg: {
                width: '1.25vw',
                height: '1.25vw',
            }
        }),
    };

    /**
     * 進階篩選
     * @param {*} selected 
     */
    const CommentHandleChange = (selected) => {
        setCommentSelectedOption(selected);
    };

    /**
     * 篩選價格
     * @param {*} selected 
     */
    const PriceHandleChange = (selected) => {
        setPriceSelectedOption(selected);
    };

    /**獲取初始化頁面資料 */
    const fetchData = async () => {
        setMask(true);
        let apiUrl = '';
        let requestBody = {};

        // 使用提取到的 queryString 創建 URLSearchParams
        const queryParams = new URLSearchParams(location.search);
        const searchType = queryParams.get('searchType');
        const keyword = queryParams.get('keyword');
        const urlCategory = queryParams.get('category'); // 從 URL 獲取的是英文鍵

        try {
            let data = [];
            if (searchType === 'keyword' && keyword) {
                apiUrl = `${process.env.REACT_APP_API_URL}/frame/search`;
                requestBody = { keyword: keyword };
                const response = await axios.post(apiUrl, requestBody);

                if (response.status === 200) {
                    // 確保 results 是陣列
                    data = Array.isArray(response.data.results) 
                        ? response.data.results 
                        : [];
                }
                else if(response.status === 204){
                    data = [];  // 204 時設為空陣列
                    alert("找不到符合條件的商品");
                }

            }
            else if (searchType === 'category') {
                const backendCategory = backendCategoryMap[urlCategory];

                apiUrl = `${process.env.REACT_APP_API_URL}/goodpage/product`;
                if (backendCategory && backendCategory !== "all") {
                    apiUrl += `?category=${encodeURIComponent(backendCategory)}`;
                }
                const response = await axios.get(apiUrl);
                if (response) {
                    // 後端回傳格式：{"results": [...]}
                    data = response.data.results || response.data || [];
                }
            }

            // 新增：先設原始資料，不立即抓圖片
            setOriginalData(data);
            setFilteredData(data);
            setMask(false);
        }
        catch (err) {
            setOriginalData([]);
            setMask(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [location.search]);

        // 新增：前端逐步快取圖片，不阻塞渲染
    useEffect(() => {
        if (!originalData.length) return;

        // 找出尚未快取的商品 pId
        const uncachedItems = originalData.filter(item => !imageMap[item.pId]);
        if (!uncachedItems.length) return;

        // 逐步抓取圖片，每抓到一張就更新 imageMap
        uncachedItems.forEach(item => {
            getProductPic(item.pId)
                .then(pic => {
                    setImageMap(prev => ({
                        ...prev,
                        [item.pId]: pic || 'placeholder.jpg'
                    }));
                })
                .catch(err => {
                    console.error(`抓圖片失敗: ${item.pId}`, err);
                    setImageMap(prev => ({
                        ...prev,
                        [item.pId]: 'placeholder.jpg'
                    }));
                });
        });
    }, [originalData]);

    // 過濾和排序邏輯 (基於 originalData) - 保持不變
    useEffect(() => {
        if(originalData.length > 0) {

            let data = [...originalData];
    
            const min = parseFloat(priceMin);
            const max = parseFloat(priceMax);
            if (!isNaN(min)) {
                data = data.filter(item => item.price_min >= min);
            }
            if (!isNaN(max)) {
                data = data.filter(item => item.price_min <= max);
            }
    
            if (CommentSelectedOption?.value === 'option1') {
                data.sort((a, b) => b.review - a.review);
            } else if (CommentSelectedOption?.value === 'option2') {
                data.sort((a, b) => a.review - b.review);
            }
    
            if (PriceSelectedOption?.value === 'option4') {
                data.sort((a, b) => b.price_min - a.price_min);
            } else if (PriceSelectedOption?.value === 'option5') {
                data.sort((a, b) => a.price_min - b.price_min);
            }
    
            setFilteredData(data);
    
            if (CommentSelectedOption?.value === 'option0' && PriceSelectedOption?.value === 'option3' && priceMin === '' && priceMax === '') {
                setFilteredData(originalData);
            }
        }
    }, [CommentSelectedOption, PriceSelectedOption, priceMin, priceMax, originalData]);


    
    return (
        <div className="SearchResult">
            <div className="SRFilter" style={{ gap: "20px"}}>
                <div style={{display: "flex", alignItems: "center"}}>
                    <div className="SRFilterText" style={{marginRight: "1vw"}}>進階篩選</div>
                    <div className="SRFilterPrice" >
                        <Select
                            value={CommentSelectedOption}
                            onChange={CommentHandleChange}
                            options={CommentOptions}
                            styles={selectOptionStyles}
                            placeholder="評論"
                        />
                    </div>
                    <div className="SRFilterPrice" >
                        <Select
                            value={PriceSelectedOption}
                            onChange={PriceHandleChange}
                            options={PriceOptions}
                            styles={selectOptionStyles}
                            placeholder="價格"
                        />
                    </div>
                </div>
                <div>
                    <div className="SRFilterRange">
                        <div className="SRFilterRangeText">價格區間</div>
                        <div className="SRFilterRangeMin">
                            <input
                                type="text"
                                placeholder="$ 最小值"
                                value={priceMin}
                                onChange={(e) => setPriceMin(e.target.value)}
                            />
                        </div>
                        <div className="SRFilterRangeText">-</div>
                        <div className="SRFilterRangeMax">
                            <input
                                type="text"
                                placeholder="$ 最大值"
                                value={priceMax}
                                onChange={(e) => setPriceMax(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {filteredData.length > 0 && filteredData.map((item, index) => (
                <div className="SRDisplay" key={item.pId || index}>
                    <div className="SRDisplayPic">
                        <img src={imageMap[item.pId] || 'placeholder.jpg'} alt={"商品"} /> 
                    </div>
                    <NavLink to={`/GoodsDetailPage?pId=${item.pId}`} className="SRLink">
                        <div className="SRDisplayProduct">
                            <div className="SRDProBrand">{item.brand}</div>
                            <div className="SRDProName">{item.pName}</div>
                            <div className="SRDProPrice">
                                <span className="HPCOriginal"> $ {item.price_max}</span>
                                <span className="HPCSale"> $ {item.price_min} </span>

                            </div>
                            <div className="SRDProRate">
                                <ImStarFull size={15} color="gold" />
                                <span className="SRDProRScore">&nbsp;{item.review !== null ? item.review.toFixed(1) : 'N/A'}</span>
                            </div>
                        </div>
                    </NavLink>
                </div>
            ))}
        </div>
    );
};

export default SearchResult;