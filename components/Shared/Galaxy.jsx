// src/shared/GalaxyBackground.jsx
import React, { useRef, useEffect } from "react";

const GalaxyCanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const parallaxFactor = 0.3; // hệ số parallax: 0 = fixed, 1 = cùng tốc scroll

    // Khởi tạo kích thước retina & canvas
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      return { w, h };
    };
    let { w: width, h: height } = resize();

    // Tạo data cho stars & flares
    const createStars = () =>
      Array.from({ length: 170 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        period: Math.random() * 1.5 + 1.5,
      }));
    const createFlares = () =>
      Array.from({ length: 8 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 15 + 5,
        angle: Math.random() * 360,
        phase: Math.random() * Math.PI * 2,
        period: Math.random() * 2 + 4,
      }));
    let stars = createStars();
    let flares = createFlares();
    let animId;

    // Hàm vẽ
    const render = () => {
      const now = Date.now() / 1000;
      ctx.clearRect(0, 0, width, height);

      // Vẽ stars
      for (let s of stars) {
        const θ = (2 * Math.PI * now) / s.period + s.phase;
        const f = 0.5 + 0.5 * Math.sin(θ);
        const opacity = 0.2 + 0.8 * f;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity.toFixed(2)})`;
        ctx.fill();
      }

      // Vẽ flares (giữ nguyên từ bản bạn đã chốt)
      for (let f of flares) {
        const θ = (2 * Math.PI * now) / f.period + f.phase;
        const pulse = 0.5 + 0.5 * Math.sin(θ);
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = pulse;
        ctx.globalCompositeOperation = "lighter";

        const mainLen = f.size;
        const secLen = f.size * 0.6;
        const mainW = 2;
        const secW = 1;
        const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];

        angles.forEach((ang, i) => {
          const len = i % 2 === 0 ? mainLen : secLen;
          const w = i % 2 === 0 ? mainW : secW;
          ctx.save();
          ctx.rotate(ang);
          const grad = ctx.createLinearGradient(0, -len, 0, len);
          grad.addColorStop(0, "rgba(255,255,255,0)");
          grad.addColorStop(0.5, "rgba(255,255,255,0.8)");
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(0, -len);
          ctx.lineTo(0, len);
          ctx.stroke();
          ctx.restore();
        });

        // Core nhỏ blur
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        const coreR = f.size * 0.15;
        ctx.shadowBlur = coreR * 2;
        ctx.shadowColor = "rgba(255,255,255,0.6)";
        const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
        cg.addColorStop(0, "rgba(255,255,255,1)");
        cg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(0, 0, coreR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };
    render();

    // Parallax scroll
    const handleScroll = () => {
      const y = window.scrollY;
      // di chuyển canvas theo tỉ lệ parallax
      canvas.style.transform = `translateY(${y * parallaxFactor}px)`;
    };
    window.addEventListener("scroll", handleScroll);

    // Bắt sự kiện resize
    const onResize = () => {
      const dims = resize();
      width = dims.w;
      height = dims.h;
      stars = createStars();
      flares = createFlares();
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        background: "transparent",
        willChange: "transform",
      }}
    />
  );
};

export default GalaxyCanvasBackground;
