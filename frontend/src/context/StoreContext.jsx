/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const [discount, setDiscount] = useState(0);

  const url = import.meta.env.VITE_BACKEND_URL;

  // Axios auth header config
  const authHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      await axios.post(`${url}/api/cart/add`, { itemId }, authHeader);
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 1) - 1, 0),
    }));

    if (token) {
      await axios.post(`${url}/api/cart/remove`, { itemId }, authHeader);
    }
  };

  const loadCartData = async (tokenValue) => {
    const response = await axios.post(
      `${url}/api/cart/get`,
      {},
      { headers: { Authorization: `Bearer ${tokenValue}` } }
    );
    setCartItems(response.data.cartData || {});
  };

  const getTotalCartAmount = () => {
    let total = 0;

    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = food_list.find(
          (product) => product._id === itemId
        );
        if (itemInfo) {
          total += itemInfo.price * cartItems[itemId];
        }
      }
    }
    return total;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(`${url}/api/food/list`);
    setFoodList(response.data.data || []);
  };

  useEffect(() => {
    fetchFoodList();

    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      loadCartData(storedToken);
    }
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    discount,
    setDiscount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
