import React from "react";
// import RackCreation from "../src/pages/rackcreation/RackCreation";
// import Reelstorage from "../src/pages/reelstorage/ReelStoragee";
import Layout from "./component/layout/Layout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Component from "../src/pages/component/Component";
import Notification from "./component/Notification";
import Racks from "./pages/rackcreation/Racks";
import ReelHistory from "./pages/reelhistory/ReelHistory";
import Inventory from "./pages/inventory/Inventory";
import User from "./pages/user/User";
import Picklist from "./pages/picklist/Picklist";
import SignIn from "./pages/signin/SignIn";
import ReelRackDashboard from "./pages/dashboard/ReelRackDashboard";
import Manufacturer from "./pages/manufacturer/Manufacturer";
import Reel from "./pages/reel/Reel";
import InventoryHistory from "./pages/inventory/InventoryHistory";
import AuditLog from "./pages/audit/AuditLog";
function App() {
  return (
    <BrowserRouter>
      {/* Sonner Toaster must be inside BrowserRouter */}
      <Toaster position="top-right" richColors closeButton />

      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="" element={<Layout />}>
          <Route path="component" element={<Component />} />
          <Route path="racks" element={<Racks />} />
          <Route path="reelhistory" element={<ReelHistory />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="picklist" element={<Picklist />} />
          <Route path="user" element={<User />} />
          <Route path="notification" element={<Notification />} />
          <Route path="dashboard" element={<ReelRackDashboard />} />
          <Route path="manufecturer" element={<Manufacturer />} />
          <Route path="reel" element={<Reel />} />
          <Route path="inventoryhistory" element={<InventoryHistory /> } />
          <Route path="auditlog" element={<ReelHistory /> } />
 
          {/* <Route path="rackcreation" element={<RackCreation />} /> */}
          {/* <Route path="reelstorage" element={<Reelstorage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
