import { useAuth } from "../Hooks/useAuth"
import ProductDetail from "./ProductDetail";
import ProductDetailPublic from "./ProductDetailPublic";

const ProductDetailDecider = () => {
    const {user}=useAuth();
    return (
        user ? <ProductDetail/> :<ProductDetailPublic/>
    )
}
export default ProductDetailDecider;