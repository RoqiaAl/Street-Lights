import PropTypes from "prop-types";
import { GoogleMap, MarkerF, InfoWindowF } from "@react-google-maps/api";
import React, { memo, useState } from "react";

const styles = {
  container: {
    width: "100%",
    height: "400px",
  },
  infoWindow: {
    padding: "10px",
    fontFamily: "'Arial', sans-serif",
    fontSize: "14px",
    backgroundColor: "#fff",
    border: "2px solid #007BFF",
    borderRadius: "10px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    color: "#333",
  },
  title: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: "5px",
  },
  label: {
    fontWeight: "bold",
    marginRight: "5px",
  },
  infoRow: {
    marginBottom: "5px",
  },
};

const MapComponent = ({ data, mapCenter }) => {
  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const defaultMapCenter = { lat: 24.7136, lng: 46.6753 };
  const centerToShow = mapCenter || defaultMapCenter;

  const handleMarkerClick = (marker) => {
    setActiveMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
  };

  // تحديد لون الدبوس بناءً على حالة اللمبة
  const getMarkerColor = (status, isOn) => {
    // 1) malfunctioning → أحمر أكثر تشبعاً (هنا اخترنا red-pushpin بدلاً من red-dot)
    if (status === "malfunctioning") {
      return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    }
    // 2) functioning && turned on → أخضر
    if (status === "functioning" && isOn) {
      return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    }
    // 3) functioning && turned off → أصفر
    if (status === "functioning" && !isOn) {
      return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    }
    // في أي حالة أخرى أو عدم توفّر البيانات
    return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <GoogleMap
          onLoad={setMap}
          id="shapes-example"
          mapContainerStyle={styles.container}
          center={centerToShow}
          zoom={14}
        >
          {data?.length > 0 &&
            data.map(({ location, lightid, status, zone, brightness, isOn }, index) => (
              <MarkerF
                key={index}
                position={{ lat: location[1], lng: location[0] }}
                onClick={() => handleMarkerClick(index)}
                icon={{
                  url: getMarkerColor(status, isOn), // تحديد لون الدبوس
                }}
              >
                {activeMarker === index && (
                  <InfoWindowF onCloseClick={handleInfoWindowClose}>
                    <div style={styles.infoWindow}>
                      <p style={styles.title}>Light Details</p>
                      <p style={styles.infoRow}>
                        <span style={styles.label}>ID:</span> {lightid}
                      </p>
                      <p style={styles.infoRow}>
                        <span style={styles.label}>Status:</span> {status}
                      </p>
                      <p style={styles.infoRow}>
                        <span style={styles.label}>Zone:</span> {zone}
                      </p>
                      <p style={styles.infoRow}>
                        <span style={styles.label}>Brightness:</span> {brightness}%
                      </p>
                    </div>
                  </InfoWindowF>
                )}
              </MarkerF>
            ))}
        </GoogleMap>
      </div>
    </div>
  );
};

MapComponent.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      location: PropTypes.arrayOf(PropTypes.number).isRequired,
      lightid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      status: PropTypes.string.isRequired,
      zone: PropTypes.string.isRequired,
      brightness: PropTypes.number.isRequired,
      isOn: PropTypes.bool.isRequired, // الحقل الذي يحدد إن كانت اللمبة تعمل أم لا
    })
  ).isRequired,
  mapCenter: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
};

export default memo(MapComponent);
