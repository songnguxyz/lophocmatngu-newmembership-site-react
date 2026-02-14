import React from "react";
import useMediaQuery from "./useMediaQuery";

export default function ReorderLayout({ mobileOrder = [], children }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  // Khi mobile: render mảng mobileOrder (lọc bỏ giá trị falsy)
  // Khi desktop: render children
  return (
    <>
      {isMobile
        ? mobileOrder.filter((c) => Boolean(c))
        : React.Children.map(children, (c) => c)}
    </>
  );
}
