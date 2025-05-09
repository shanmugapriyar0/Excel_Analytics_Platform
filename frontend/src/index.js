import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./css/index.css";
import "./css/responsive.css";
import { store } from './redux/store'; // Import the Redux store
import { Provider } from 'react-redux'; // Import Provider
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    {/* Wrap App with Provider and pass the store */}
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);