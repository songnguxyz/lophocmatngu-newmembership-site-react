import React, { useState, useEffect } from "react";
import SectionUser from "./SectionUser";
import SectionPacks from "./SectionPacks";
import SectionResult from "./SectionResult";
import Loading from "./Loading";
import { auth, db, firebaseReady } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import styles from "./Gacha.module.css";
import GradientBackground from "./GradientBackground";
import usePreloadTemplateImages from "./usePreloadTemplateImages";
import MyCard from "./MyCard";

const GachaTest = () => {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState("");
  const [userCoins, setUserCoins] = useState(0);
  const [phase, setPhase] = useState("selection"); // 'selection' | 'loading' | 'results'
  const [pickedCards, setPickedCards] = useState([]);
  const selectedPack = packs.find((p) => p.id === selectedPackId);
  const preloadDone = usePreloadTemplateImages(selectedPack);
  const [pendingCards, setPendingCards] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadPacks = async () => {
      const snap = await getDocs(collection(db, "gachaPacks"));
      const packList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPacks(packList);
      if (packList.length > 0) setSelectedPackId(packList[0].id);
    };
    loadPacks();
  }, []);

  const loadUserCoins = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      setUserCoins(data.xu ?? 0);
    }
  };

  useEffect(() => {
    let unsubscribe;
    firebaseReady.then(() => {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) loadUserCoins();
      });
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleRoll = async () => {
    setPhase("loading");
    setErrorMsg("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");
      const token = await user.getIdToken();

      console.time("ROLL_API");
      const res = await axios.post(
        "https://us-central1-membership-1c8c5.cloudfunctions.net/rollGacha",
        { data: { packId: selectedPackId } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.timeEnd("ROLL_API");

      setPendingCards(res.data.data.pickedCards);
      loadUserCoins();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || error.message);
      setPhase("selection");
    }
  };
  
  useEffect(() => {
    if (pendingCards && preloadDone) {
      setPickedCards(pendingCards);
      setPendingCards(null);
      setPhase("results");
    }
  }, [pendingCards, preloadDone]);
  

  const reset = () => {
    setPickedCards([]);
    setPhase("selection");
  };

  return (
    <>
      <GradientBackground />
      <div className={styles.container}>
        {phase === "selection" && (
          <>
            <SectionUser xu={userCoins} />
            <SectionPacks
              packs={packs}
              selectedPackId={selectedPackId}
              setSelectedPackId={setSelectedPackId}
              onRoll={handleRoll}
              error={errorMsg}
            />
          </>
        )}
        {phase === "loading" && <Loading />}

        {phase === "results" && (
          <SectionResult
            cards={pickedCards}
            onRetry={reset}
            setPhase={setPhase}
          />
        )}
        
        {phase === "mycard" && <MyCard />}
      </div>
    </>
  );
  
};

export default GachaTest;
