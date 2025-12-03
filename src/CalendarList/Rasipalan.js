import { useNavigate, useLocation } from "react-router-dom";
import "../styles/RasiStyles.css";
import img1 from "./Assets/mesham.jpg";
import img2 from "./Assets/rishabam.jpg";
import img3 from "./Assets/midhunam.jpg";
import img4 from "./Assets/kadagam.jpg";
import img5 from "./Assets/simmam.jpg";
import img6 from "./Assets/kanni.jpg";
import img7 from "./Assets/thulam.jpg";
import img8 from "./Assets/viruchigam.jpg";
import img9 from "./Assets/dhanusu.jpg";
import img10 from "./Assets/magaram.jpg";
import img11 from "./Assets/kumbam.jpg";
import img12 from "./Assets/meenam.jpg";

const rasiList = [
  { id: 1, name: "மேஷம்", image: img1 },
  { id: 2, name: "ரிஷபம்", image: img2 },
  { id: 3, name: "மிதுனம்", image: img3 },
  { id: 4, name: "கடகம்", image: img4 },
  { id: 5, name: "சிம்மம்", image: img5 },
  { id: 6, name: "கன்னி", image: img6 },
  { id: 7, name: "துலாம்", image: img7 },
  { id: 8, name: "விருச்சிகம்", image: img8 },
  { id: 9, name: "தனுசு", image: img9 },
  { id: 10, name: "மகரம்", image: img10 },
  { id: 11, name: "கும்பம்", image: img11 },
  { id: 12, name: "மீனம்", image: img12 }
];

const durationMap = {
  daily: "இன்றைய",
  weekly: "வார",
  monthly: "மாத",
  yearly: "வருட"
};

export default function RasiList() {
  const navigate = useNavigate();
  const location = useLocation();
  const duration = new URLSearchParams(location.search).get("duration");

  function openRasi(rasi) {
    navigate(
      `/rasi-details?rasiId=${rasi.id}&rasiName=${encodeURIComponent(
        rasi.name
      )}&duration=${duration}`
    );
  }

  return (
    <div className="rasi-container-details">
      <div className="star-bg"></div>
      <h2 className="h2">{durationMap[duration]} ராசிபலன்</h2>

      <div className="grid">
        {rasiList.map((rasi) => (
          <button key={rasi.id} onClick={() => openRasi(rasi)} className="buttons">

            {rasi.image && (
              <img src={rasi.image} alt={rasi.name} className="rasi-imgs" />
            )}

            {/* <span className="span">{rasi.name}</span> */}
          </button>
        ))}
      </div>
    </div>
  );
}
