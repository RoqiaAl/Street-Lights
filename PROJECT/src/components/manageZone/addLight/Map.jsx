import PropTypes from "prop-types";
import { Polygon, GoogleMap, Marker } from "@react-google-maps/api";
import React, { memo, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";

const styles = {
    container: {
        width: "100%",
        height: "400px",
    },
};

const MapComponent = ({ triangleCoords, mapCenter, onLocationSelect }) => {
    const [map, setMap] = useState(null);
    const [clickedPosition, setClickedPosition] = useState(null);

    const polygonRef = useRef(null);
    const listenersRef = useRef([]);

    const defaultMapCenter = {
        lat: 24.7136,
        lng: 46.6753,
    };



    const onLoad = useCallback(
        (polygon) => {
            polygonRef.current = polygon;
            const path = polygon.getPath();

        },
        []
    );

    const onUnmount = useCallback(() => {
        listenersRef.current.forEach((listener) => listener.remove());
        polygonRef.current = null;
    }, []);

    const handleMapClick = useCallback(
        (e) => {
            const clickedCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };

            if (triangleCoords?.length > 0) {
                if (polygonRef.current && map) {
                    const point = new window.google.maps.Polygon({
                        paths: triangleCoords,
                    });
                    const isInsidePolygon =
                        window.google.maps.geometry.poly.containsLocation(
                            e.latLng,
                            point
                        );
                    if (isInsidePolygon) {
                        setClickedPosition(clickedCoords);
                        onLocationSelect(clickedCoords)

                        // window.alert("You Can Select Location inside Land");

                    } else {
                        toast.warning("Please Select Location inside Zone");
                        return null;
                    }
                }
            }

            // Update triangleCoords with a new reference
        },
        [triangleCoords, map]
    );

    const centerToShow = mapCenter || defaultMapCenter;

    return (
        <div className="w-full">
            <div className="w-full">
                <GoogleMap
                    onLoad={setMap}
                    id="shapes-example"
                    mapContainerStyle={styles.container}
                    center={centerToShow}
                    zoom={14}
                    onClick={handleMapClick}
                >
                    {clickedPosition && (
                        <Marker
                            position={clickedPosition}

                        />
                    )}
                    {triangleCoords?.length > 0 && (
                        <Polygon
                            path={triangleCoords}
                            options={{
                                clickable: false,
                                strokeColor: "#FFFFFF",
                                fillColor: "#FFFFFF",
                            }}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                        />
                    )}
                </GoogleMap>
            </div>
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
    setTriangleCoords: PropTypes.func.isRequired,
    mapCenter: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
    }),
};

export default memo(MapComponent);
