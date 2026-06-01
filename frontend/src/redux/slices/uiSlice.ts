import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
}

const initialState: UIState = {
  isMobileMenuOpen: false,
  isSearchOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    closeSearch: (state) => {
      state.isSearchOpen = false;
    },
  },
});

export const { toggleMobileMenu, closeMobileMenu, toggleSearch, closeSearch } = uiSlice.actions;
export default uiSlice.reducer;