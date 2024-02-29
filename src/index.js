import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import {CookiesProvider} from 'react-cookie';
//import Pages
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";

const routerConfig = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/SignUp",
    element: <SignUp />,
  },
];

const router = createBrowserRouter(routerConfig);

<CookiesProvider>{router}</CookiesProvider>;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);