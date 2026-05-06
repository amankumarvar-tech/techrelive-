import { createSlice } from "@reduxjs/toolkit";

const stored = JSON.parse(localStorage.getItem("tr_cart") || "[]");

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: stored },
  reducers: {
    addToCart(state, action) {
      const exists = state.items.find((i) => i._id === action.payload._id);
      if (!exists) state.items.push(action.payload);
      localStorage.setItem("tr_cart", JSON.stringify(state.items));
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i._id !== action.payload);
      localStorage.setItem("tr_cart", JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem("tr_cart");
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
