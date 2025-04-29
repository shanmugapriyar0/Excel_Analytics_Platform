// frontend/src/index.js (Modify this file)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";
import "./responsive.css";
import { store } from './redux/store'; // Import the Redux store
import { Provider } from 'react-redux'; // Import Provider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Wrap App with Provider and pass the store */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);