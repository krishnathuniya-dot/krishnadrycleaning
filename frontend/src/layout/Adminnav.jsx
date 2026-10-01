import React from "react";
import { Outlet } from "react-router-dom";

import Adminlayout from "../pages/Adminlayout";

export default function Adminnavv() {
  return (
    <div className="admin-layout">
     <Adminlayout></Adminlayout>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}