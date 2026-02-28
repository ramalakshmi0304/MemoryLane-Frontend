import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MemoryMap = ({ memories }) => {
  const navigate = useNavigate(); // Hook to redirect to details page
  const mapCenter = [20, 0]; 

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100">
      <MapContainer center={mapCenter} zoom={2} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {memories.map((m) => {
          if (!m.lat || !m.lng) return null; 

          // Match the display logic from your MemoryCard
          const mediaUrl = m.display_url || m.media_url || "/placeholder-memory.jpg";

          return (
            <Marker key={m.id} position={[m.lat, m.lng]}>
              <Popup className="custom-popup">
                <div className="w-48 p-1">
                  {/* Mini Preview Image */}
                  <img 
                    src={mediaUrl} 
                    alt={m.title} 
                    className="w-full h-24 object-cover rounded-lg mb-2 border border-slate-100"
                  />
                  <h3 className="font-bold text-slate-800 leading-tight">{m.title}</h3>
                  <p className="text-[10px] text-slate-500 mb-2">{m.location}</p>
                  
                  {/* Navigation Button */}
                  <button 
                    onClick={() => navigate(`/memory/${m.id}`)}
                    className="w-full py-1.5 bg-[#c87a3f] text-white text-xs font-bold rounded-md hover:bg-[#b06a35] transition-colors"
                  >
                    View Story
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MemoryMap;