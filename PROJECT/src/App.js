import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/AuthContext"; // Ensure you're importing AuthProvider here
import AllStreetLights from "./components/manageStreetLights/AllStreetLights";
import AddStreetLight from "./components/manageStreetLights/AddStreetLight";
import LightsInfo from "./components/manageStreetLights/LightsInfo";
import UpdateStreetLight from "./components/manageStreetLights/UpdateStreetLight";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AllZone from "./components/manageZone/allzone";
import AddZone from "./components/manageZone/addzone";
import LightsInfoZone from "./components/manageZone/addzone/lightInfo";
import EditZone from "./components/manageZone/editZone";
import LightsInfoZoneEdit from "./components/manageZone/editZone/lightinfo";
import ViewZone from "./components/manageZone/view";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<AllStreetLights />} />
            <Route path="/add-lights" element={<AddStreetLight />} />
            <Route path="/all-zone" element={<AllZone />} />
            <Route path="/add-zone" element={<AddZone />} />
            <Route path="/edit-zone/:id" element={<EditZone />} />
            <Route
              path="/edit-zone/:id/light"
              element={<LightsInfoZoneEdit />}
            />
            <Route path="/view-zone/:id" element={<ViewZone />} />
            <Route path="/add-zone/light" element={<LightsInfoZone />} />
            <Route path="/update-lights" element={<UpdateStreetLight />} />
            <Route path="/lights-info" element={<LightsInfo />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
