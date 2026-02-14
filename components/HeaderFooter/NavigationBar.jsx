import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import styles from "./NavigationBar.module.css";
import useAdminCheck from "../../hooks/useAdminCheck";

import { useFirebase } from "../../context/FirebaseContext";
import { signOut } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const NavigationBar = () => {
  const [rawNavItems, setRawNavItems] = useState([]);
  const [navigationItems, setNavigationItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, isLoading: isAdminLoading } = useAdminCheck();
  const { initializing, auth } = useFirebase();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "navigationItems"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRawNavItems(items);
    });
    return () => unsubscribe();
  }, []);

  // Lọc items mỗi khi rawNavItems hoặc user thay đổi
  useEffect(() => {
    const filtered = rawNavItems
      .filter((item) => item.active)
      .filter(
        (item) =>
          item.visibleTo === "all" || (item.visibleTo === "auth" && user)
      );
    setNavigationItems(filtered);
  }, [rawNavItems, user]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleNavClick = (url) => {
    closeMenu();
    setTimeout(() => navigate(url), 10);
  };

  if (initializing || isAdminLoading) return null;

  return (
    <nav className={styles.navigationBar}>
      <div className={styles.navWrapper}>
        <Link to="/" className={styles.logo}>
          LHMN
        </Link>

        <button
          className={styles.menuIcon}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </button>

        <div
          className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}
        >
          <ul className={styles.navList}>
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  className={styles.linkBtn}
                  onClick={() => handleNavClick(item.url)}
                >
                  {item.label}
                </button>
              </li>
            ))}

            {user ? (
              <>
                {isAdmin && (
                  <li>
                    <button
                      className={styles.linkBtn}
                      onClick={() => handleNavClick("/admin")}
                    >
                      Trang Admin
                    </button>
                  </li>
                )}
                <li className={styles.userRow}>
                  <span className={styles.userGreeting}>
                    Xin chào,{" "}
                    <span className={styles.userName}>{user.displayName}</span>
                  </span>

                  <button
                    className={styles.logoutButton}
                    onClick={handleSignOut}
                  >
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button
                  className={styles.linkBtn}
                  onClick={() => handleNavClick("/login")}
                >
                  Đăng nhập
                </button>
              </li>
            )}
          </ul>
        </div>

        {isMenuOpen && <div className={styles.overlay} onClick={closeMenu} />}
      </div>
    </nav>
  );
};

export default NavigationBar;
