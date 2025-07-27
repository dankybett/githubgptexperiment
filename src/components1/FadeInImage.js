import React from "react";

export default function FadeInImage({
  src,
  alt,
  className = "",
  style = {},
  ...props
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      className={`${className} transition-opacity duration-300 ${
        loaded && !error ? "opacity-100" : "opacity-0"
      }`}
      style={{
        ...style,
        backgroundColor: loaded ? "transparent" : "#f3f4f6",
      }}
      {...props}
    />
  );
}

