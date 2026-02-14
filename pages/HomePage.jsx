// src/pages/HomePage.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAdminCheck from "../hooks/useAdminCheck";
import { useFirebase } from "../context/FirebaseContext";
import { signOut } from "firebase/auth";


const HomePage = () => {
  const { user, isAdmin, isLoading } = useAdminCheck();
  const { auth } = useFirebase();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
     navigate("/login");
    } catch (error) {
     console.error("Lỗi đăng xuất:", error);
    }
  };

   if (isLoading) {
     return <div>Đang kiểm tra quyền...</div>;
   }

   return (
     <div>
       {user ? (
         <div>
           <p>Xin chào, {user.displayName}!</p>
           {isAdmin && <p>Bạn là admin!</p>}

          <button onClick={handleSignOut}>Đăng xuất</button>
           {isAdmin && <Link to="/admin">Go to Admin Area</Link>}
         </div>
       ) : (
         <div>
           <p>Bạn chưa đăng nhập.</p>
           {/* <Login /> Hiển thị component Login */}
         </div>
       )}
     </div>
   );
 };

 export default HomePage;
