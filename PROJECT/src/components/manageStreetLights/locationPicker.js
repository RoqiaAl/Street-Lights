import React, { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  Polygon,
  useLoadScript,
  Marker,
} from "@react-google-maps/api";

const mapContainerStyle = {
  height: "400px",
  width: "100%",
};

const defaultCenter = {
  lat: 24.7136,
  lng: 46.6753,
};

const libraries = ["places"];

function LocationPicker({ onLocationSelect, zoneBoundaries }) {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isLocationValid, setIsLocationValid] = useState(true);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBjCdUh4aafEzIIFmVRoq7i48RNZ0rndhY", // Replace with your API key
    libraries,
  });

  // Transform zoneBoundaries if necessary (assuming they come as [lng, lat])
  const formattedZoneBoundaries = zoneBoundaries
    ? zoneBoundaries.map((coord) => ({
        lat: coord[1], // second element is latitude
        lng: coord[0], // first element is longitude
      }))
    : null;

  console.log("Formatted Zone Boundaries:", formattedZoneBoundaries);

  // Check if a point is inside a polygon
  const isPointInPolygon = (point, polygon) => {
    // Note: if your coordinates are in the form {lat, lng} and the algorithm expects x as lng and y as lat,
    // you may need to swap them. If it was working before, you might leave this as is.
    const x = point.lat;
    const y = point.lng;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  };

  const onMapClick = useCallback(
    (event) => {
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };

      // Check if the clicked location is within the zone boundaries
      if (
        formattedZoneBoundaries &&
        isPointInPolygon(position, formattedZoneBoundaries)
      ) {
        setMarkerPosition(position);
        onLocationSelect(position);
        setIsLocationValid(true);
      } else {
        setIsLocationValid(false);
      }
    },
    [onLocationSelect, formattedZoneBoundaries]
  );

  useEffect(() => {
    if (!formattedZoneBoundaries) {
      setMarkerPosition(null);
      setIsLocationValid(true);
    }
  }, [formattedZoneBoundaries]);

  if (loadError) {
    return <div className="p-4 text-red-500">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="p-4">Loading maps...</div>;
  }

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={12}
        onClick={onMapClick}
      >
        {/* Draw the zone boundaries if provided */}
        {formattedZoneBoundaries && (
          <Polygon
            paths={formattedZoneBoundaries}
            options={{
              fillColor: "#FF0000",
              fillOpacity: 0.2,
              strokeColor: "#FF0000",
              strokeOpacity: 1,
              strokeWeight: 2,
              clickable: false, // Allow clicks to pass through the polygon
            }}
          />
        )}

        {/* Display the marker if a valid location is selected */}
        {markerPosition && (
          <Marker
            position={markerPosition}
            icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
          />
        )}
      </GoogleMap>

      {/* Show error message if the location is outside the zone */}
      {!isLocationValid && (
        <div className="p-2 text-red-500">
          Please select a location within the zone boundaries.
        </div>
      )}
    </div>
  );
}

export default React.memo(LocationPicker);
