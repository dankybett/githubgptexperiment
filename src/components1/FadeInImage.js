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

  const [shouldFade, setShouldFade] = React.useState(true);
  const imgRef = React.useRef(null);

  // If the image was already cached, mark it as loaded immediately
  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
      setShouldFade(false);
    }
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      className={`${className} ${
        shouldFade ? "transition-opacity duration-300" : ""
      } ${loaded && !error ? "opacity-100" : "opacity-0"}`}
      style={{
        ...style,
        backgroundColor: loaded ? "transparent" : "#f3f4f6",
      }}
      {...props}
    />
  );
}
