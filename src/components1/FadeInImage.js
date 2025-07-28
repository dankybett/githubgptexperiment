import React from "react";

export default function FadeInImage({
  src,
  alt,
  className = "",
  style = {},
  ...props
}) {
  const imgRef = React.useRef(null);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const [shouldFade, setShouldFade] = React.useState(true);

  // If the image was already cached, mark it as loaded immediately before paint
  React.useLayoutEffect(() => {
    if (
      imgRef.current &&
      imgRef.current.complete &&
      imgRef.current.naturalWidth !== 0
    ) {
      setLoaded(true);
      setShouldFade(false);
    }
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onLoad={() => {
        setLoaded(true);
         if (imgRef.current && imgRef.current.naturalWidth !== 0) {
          setShouldFade(false);
        }
      }}
      onError={() => setError(true)}
      className={`${className} ${
        shouldFade ? "transition-opacity duration-300" : ""
      } ${loaded && !error ? "opacity-100" : "opacity-0"}`}
      style={{
        ...style,
         opacity: loaded && !error ? 1 : 0,
        backgroundColor: loaded ? "transparent" : "#f3f4f6",
      }}
      {...props}
    />
  );
}
