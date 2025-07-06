import PropTypes from "prop-types";
import { Polygon, GoogleMap } from "@react-google-maps/api";
import React, { memo, useState } from "react";

const styles = {
  container: {
    width: "100%",
    height: "400px",
  },
};

const MapComponent = ({ triangleCoords, mapCenter }) => {
  const [map, setMap] = useState(null);
  const defaultMapCenter = {
    lat: 24.7136,
    lng: 46.6753,
  };

  const centerToShow = mapCenter || defaultMapCenter;

  return (
    <div className="w-full">
      <GoogleMap
        onLoad={setMap}
        id="shapes-example"
        mapContainerStyle={styles.container}
        center={centerToShow}
        zoom={14}
      >
        {triangleCoords?.length >= 3 && (
          <Polygon
            path={triangleCoords}
            options={{
              clickable: false,
              editable: false,
              draggable: false,
              strokeColor: "#FF0000",
              fillColor: "#FF0000",
              fillOpacity: 0.35,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

MapComponent.propTypes = {
  triangleCoords: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    })
  ).isRequired,
  mapCenter: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
};

export default memo(MapComponent);
