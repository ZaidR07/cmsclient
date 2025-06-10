import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface adminState {
  rank: string;
  db: string;
  email: string;
}

// initial state
const initialState: adminState = {
  rank: "",
  db: "",
  email: "",
};

// create slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setRank: (state, action) => {
      state.rank = action.payload;
      console.log(action.payload);
      
    },
    setdb: (state, action) => {
      state.db = action.payload;
      console.log(action.payload);

    },
    setEmail: (state, action) => {
      state.email = action.payload;
      console.log(action.payload);

    },
  },
});

// export actions
export const { setRank, setdb , setEmail} = adminSlice.actions;

// export reducer
export default adminSlice.reducer;
