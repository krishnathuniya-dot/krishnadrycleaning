import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./component/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import Drycleaning from "./pages/Drycleaning";
import Rafu from "./pages/Rafu";
import Charak from "./pages/Charak";
import Steampress from "./pages/Steampress";

import FrontNavbar from "./layout/FrontNavbar";
import Riviews from "./pages/Riviews";
import Allreview from "./pages/Allreview";
import Dashboard from "./pages/Dashboard";
import Adminnavv from "./layout/Adminnav";
import Adminlayout from "./pages/Adminlayout";
import AdminSettings from "./pages/AdminSettings";
import AdminLogin from "./component/AdminLogin";
import Customers from "./pages/Customers";
import Reviews from "./pages/Reviews";
import AdminNotifications from "./pages/AdminNotifications";
import AdminRateList from "./pages/AdminRateList";
import AdminReports from "./pages/AdminReports";
import Help from "./pages/Help";
import UserRateList from "./pages/UserRateList";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import HomeUserRateList from "./pages/HomeUserRateList";
import ShopPage from "./pages/ShopPage";
import Shop from "./pages/ShopPage";
import CompleteProfile from "./pages/CompleteProfile";
import ShopManagement from "./pages/ShopManagement";
import Footer from "./component/Footer";
import AdminProtectedRoute from "./pages/AdminProtectedRoute";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================================
            FRONT LAYOUT
        ===================================================== */}

        <Route element={<FrontNavbar />}>

          {/* HOME */}
          <Route path="/" element={<Home />}/>
          <Route path="/shop"element={<Shop></Shop>}/> 
          <Route path="/forgot-password"element={<ForgotPassword></ForgotPassword>}/>
          <Route path="/reset-password/:token"element={<ResetPassword></ResetPassword>}/>
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />}/>
          <Route path="/services/dry-cleaning" element={<Drycleaning />}/>
          <Route path="/services/rafu"element={<Rafu />}/>
          <Route path="/rate-list" element={<UserRateList></UserRateList>}/>
          <Route path="/services/charak" element={<Charak />} />
          <Route path="/services/steam-press" element={<Steampress />}/>
          <Route path="/re" element={<Riviews></Riviews>} />
          <Route path="/all" element={<Allreview></Allreview>}/>

        </Route>

         {/* =====================================================
            Admin LAYOUT
        ===================================================== */}
       
 <Route element={<AdminProtectedRoute></AdminProtectedRoute>}>
  <Route  path="/" element={<Adminlayout></Adminlayout>}>
  
     <Route path="/dash" element={<Dashboard></Dashboard>}/> 
     <Route path="/admin/customers" element={<Customers></Customers>}/>
     <Route path="/admin/reviews" element={<Reviews></Reviews>}/>
     <Route path="/admin/notifications" element={<AdminNotifications></AdminNotifications>}/>

       <Route path="/admin/settings"element={<AdminSettings></AdminSettings>}/> 
        <Route path="/admin/rates"element={<AdminRateList></AdminRateList>}/>
        <Route path="/admin/shopmanage" element={<ShopManagement></ShopManagement>}/>
         <Route path="/admin/reports"element={<AdminReports></AdminReports>}/>
         <Route path="/admin/help"element={<Help></Help>}/>

   </Route>
   </Route>

   
<Route path="/admin" element={<AdminLogin></AdminLogin>} /> 
 
 
<Route path="/complete-profile" element={<CompleteProfile></CompleteProfile>}/>
<Route path="/footer" element={<Footer></Footer>}/>



            
           


           
          
            
            
            
            
            
           


        

      </Routes>

    </BrowserRouter>
  );
}

export default App;