import Color from "color";

export type Brand = {
  base: string;
  bright: string;
  faded: string;
};

const tryColor = (s?: string) => {
  if (!s) return undefined;
  try {
    return Color(s);
  } catch (e) {
    return undefined;
  }
};

const getBrandColors = (base?: string): Brand | undefined => {
  const brandColor = tryColor(base);
  if (!brandColor) return undefined;
  return {
    base: brandColor.toString(),
    faded: brandColor
      .alpha(0.2)
      .lightness(brandColor.lightness() + 5)
      .toString(),
    bright: brandColor.lightness(brandColor.lightness() + 5).toString(),
  };
};

export default getBrandColors;
