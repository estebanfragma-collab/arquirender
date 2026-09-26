import { useId } from "react";
import type { CatalogPoster } from "./catalog";

// Bounds of the poster panel in each supplied screenshot, in source pixels.
// SVG viewBox crops the surrounding interface without resampling or stretching it.
export const REFERENCE_BOUNDS: Record<string, [number, number, number, number, number, number]> = {
  P32:[1738,1412,14,2,1032,1376],
  P33:[1668,1414,0,16,1032,1376],
  P34:[1778,1496,58,62,1028,1370],
  P35:[1736,1456,22,28,1030,1390],
  P36:[1718,1478,16,30,1030,1376],
  P37:[1690,1418,0,6,1028,1376],
  P38:[1686,1400,4,16,1032,1376],
  P39:[1696,1428,40,32,1032,1376],
  P40:[1696,1464,8,22,1032,1376],
  P27:[1722,1434,24,42,1034,1376], P28:[1780,1380,14,6,1100,1370],
  P29:[1770,1462,20,24,1100,1376], P30:[1708,1456,18,42,1032,1376],
  P31:[1680,1390,0,4,1024,1376],
  P21:[1488,1220,0,10,844,1197], P22:[1544,1212,20,25,897,1185],
  P23:[1474,1260,22,62,800,1196], P24:[1518,1236,8,24,869,1196],
  P25:[1524,1196,16,6,840,1188], P26:[1564,1232,48,46,870,1185],
  P01: [1460,1240,14,30,800,1199], P02: [1488,1234,56,20,800,1198],
  P03: [1416,1236,15,14,800,1200], P04: [1502,1238,56,18,800,1200],
  P05: [1530,1256,80,16,800,1200], P06: [1534,1224,30,14,880,1200],
  P07: [1590,1270,36,42,900,1200], P08: [1542,1182,8,0,900,1182],
  P09: [1514,1244,52,40,800,1200], P10: [1562,1228,98,18,800,1200],
  P11: [1502,1258,40,34,800,1200], P12: [1516,1224,36,30,843,1194],
  P13: [1494,1346,62,74,800,1200], P14: [1552,1226,48,18,860,1194],
  P15: [1534,1216,20,14,844,1184], P16: [1472,1252,28,18,800,1200],
  P17: [1576,1280,48,26,840,1200], P18: [1546,1294,20,14,844,1264],
  P19: [1588,1214,46,26,900,1188], P20: [1592,1232,18,8,900,1200],
};
export default function ReferencePoster({poster}: {poster: CatalogPoster}) {
  const clip = useId();
  const [width,height,x,y,w,h] = REFERENCE_BOUNDS[poster.id];
  return <svg role="img" aria-label={`Referencia de ${poster.name}`}
    viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid meet"
    width={w} height={h} className="pl-reference-art">
    <defs><clipPath id={clip}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
    <image href={poster.image} width={width} height={height} clipPath={`url(#${clip})`} />
  </svg>;
}
