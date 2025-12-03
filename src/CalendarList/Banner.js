import { useEffect, useState } from "react";
import "../styles/RasiStyles.css";

export default function Banner() {
  const [activeBanners, setActiveBanners] = useState([]);
  const [inactiveBanners, setInactiveBanners] = useState([]);

  // Load banners from API
  useEffect(() => {
    fetch(`https://tnreaders.in/mobile/banners`)
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          const active = data.data.filter(b => b.status === 1);
          const inactive = data.data.filter(b => b.status === 0);
          setActiveBanners(active);
          setInactiveBanners(inactive);
        }
      })
      .catch(err => console.log(err));
  }, []);

  // Move banner between lists
  const toggleBannerStatus = (banner, isActive) => {
    if (isActive) {
      setActiveBanners(prev => prev.filter(b => b.id !== banner.id));
      setInactiveBanners(prev => [...prev, { ...banner, status: 0 }]);
    } else {
      setInactiveBanners(prev => prev.filter(b => b.id !== banner.id));
      setActiveBanners(prev => [...prev, { ...banner, status: 1 }]);
    }
  };

  return (
    <div className="banner-dashboard">
      <div className="banner-column">
        <h2 className="head">Active Banners</h2>
        {activeBanners.map(banner => (
          <div key={banner.id} className="banner-box">
            <h2>{banner.category}</h2>
            <a href={banner.url_link} target="_blank" rel="noopener noreferrer">
              <img src={banner.banner_link} alt="Banner" className="banner-image" />
            </a>
            <button onClick={() => toggleBannerStatus(banner, true)} className="button">
              Make Inactive
            </button>
          </div>
        ))}
      </div>

      <div className="banner-column">
        <h2  className="head">Inactive Banners</h2>
        {inactiveBanners.map(banner => (
          <div key={banner.id} className="banner-box">
             <h2>{banner.category}</h2>
            <a href={banner.url_link} target="_blank" rel="noopener noreferrer">
              <img src={banner.banner_link} alt="Banner" className="banner-image" />
            </a>
            <button onClick={() => toggleBannerStatus(banner, false)} className="button">
              Make Active
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
