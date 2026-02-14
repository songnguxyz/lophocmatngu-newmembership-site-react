// src/hooks/useAdminCheck.js
import { useState, useEffect } from "react";
import { useFirebase } from "../context/FirebaseContext";
import { checkAdminRole } from "../services/adminService";

const useAdminCheck = () => {
  const { auth, initializing } = useFirebase();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (initializing) return; // 🚀 Chờ firebase ready

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        try {
          const isAdmin = await checkAdminRole();
          setIsAdmin(isAdmin);
        } catch (error) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, initializing]);

  return { user, isAdmin, isLoading };
};

export default useAdminCheck;
