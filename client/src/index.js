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
import StudentHome from "./Pages/StudentHome";
import InstructorHome from "./Pages/InstructorHome";
import InstructorDashboard from "./Pages/InstructorDashboard";
import AddQuiz from "./Pages/AddQuiz";

const routerConfig = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/SignUp",
    element: <SignUp />,
  },
  {
    path: "/StudentHome",
    element: <StudentHome />,
  },
  {
    path: "/InstructorHome",
    element: <InstructorHome />,
  },
  {
    path:"/Instructor/Dashboard/Course/:id" ,
    element:<InstructorDashboard />
  },
  {
    path:"/Instructor/AddQuiz/:courseId/:topicId" ,
    element:<AddQuiz />
  },
];

const router = createBrowserRouter(routerConfig);

<CookiesProvider>{router}</CookiesProvider>;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);