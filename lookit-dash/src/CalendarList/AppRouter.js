import { Routes, Route } from "react-router-dom";
import SelectDuration from "./SelectDuration";
import RasiList from "./Rasipalan";
import ViewRasiForm from "./RasiDetails";
import Banner from "./Banner";
import "../styles/RasiStyles.css";

export default function AppRouter() {
  return (
  
   <Routes>
        <Route path="/" element={<SelectDuration />} />
        <Route path="/rasi-list" element={<RasiList />} />
        <Route path="/rasi-details" element={<ViewRasiForm/>} />
        <Route path="/banner" element={<Banner />} />
      </Routes>
    
  );
}
