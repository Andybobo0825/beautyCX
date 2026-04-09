import { ImStarFull} from "react-icons/im";

const ProductCards = ({ Product }) => {
  console.log(Product);
  
  return (
    <div className="HotProductsCard">
      <img
        src={Product.Image}
        alt={Product.Name}
        className="HPCImage"
      />
      <p className="HPCName">{Product.Name}</p>
      <p className="HPCPrice">
        <span className="HPCOriginal">${Product.OriginalPrice}</span>{" "}
        <span className="HPCSale">${Product.Price}</span>
      </p>
      <p className="HPCRating"> < ImStarFull/> {Product.Rating}</p>
    </div>
  );
};
  //<span className="HPCOriginal">${Product.OriginalPrice}</span>{" "}
export default ProductCards;
  