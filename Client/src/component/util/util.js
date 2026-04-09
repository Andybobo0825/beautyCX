import axios from 'axios';

/**取得單一圖檔(主要) */
export const getProductPic = async (pId) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/productPicture/${pId}/isMain`);
        if (response.data) {
            return response.data.url || "";
        }
    }
    catch (error) {
        console.error("Error fetching product picture:", error);
        throw error;
    }
}

/**取得所有圖檔 */
export const getProductAllPic = async (pId) => {
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/productPicture/${pId}`);
        if (res.data?.pictures?.length) {
            return res.data.pictures.map(pic => pic.url);
        }
        return [];
    } catch (error) {
        console.error("取得圖片失敗：", error);
        return [];
    }
}