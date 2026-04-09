import { Carousel } from "react-bootstrap";
import banner1 from "./pic/HomePagePhoto1.png"; // 自行放置示意圖
import banner2 from "./pic/HomePagePhoto2.png";
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io";

const BannerCarousel = () => {
  return (
    <div className="BannerCarousel">
      <Carousel className="Carousel mx-auto mt-4"
                prevIcon={<IoIosArrowDropleftCircle size={30} style={{ color: '#999' }}/>} 
                nextIcon={<IoIosArrowDroprightCircle size={30}  style={{ color: '#999' }}/>}>
        <Carousel.Item>
          <img className="d-block w-100" src={banner1} alt="First slide" />
        </Carousel.Item>
        <Carousel.Item>
          <img className="d-block w-100" src={banner2} alt="Second slide" />
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
