import { createSlice } from "@reduxjs/toolkit";

export const UploadedFileSlice = createSlice({
  name: "uploadedFile",
  initialState: {
    activeFile: "",
    rerender: false,
    activeFolder: ""
  },
  reducers: {
    setActiveFile: (state, { payload }) => {
      state.activeFile = payload;
    },
    setReRender: (state, {payload}) => {
      state.rerender = payload
    },
    setActiveFolderAction: (state, {payload}) => {
      state.activeFolder = payload
    }
  },
});

// Action creators are generated for each case reducer function
export const { setActiveFile, setReRender, setActiveFolderAction } = UploadedFileSlice.actions;

export default UploadedFileSlice.reducer;
