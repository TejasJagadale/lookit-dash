import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./Pages/Dashboard";
import NotificationList from "./components/NotificationList";
import Schedule from "./components/ScheduleForm";
import PostDetail from "./components/PostDetail";
import "./index.css";
import MainCategory from "./components/MainCategory.js";
import CategoryPage from "./components/CategoryPage.js";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notifications" element={<NotificationList />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/Sub-Category" element={<MainCategory />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
