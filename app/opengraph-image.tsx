import { ImageResponse } from "next/og";

export const alt = ":)";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#ffffff",
          color: "#000000",
          display: "flex",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 128,
          height: "100%",
          justifyContent: "center",
          letterSpacing: 0,
          width: "100%"
        }}
      >
        :)
      </div>
    ),
    size
  );
}
