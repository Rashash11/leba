"use client";

import { forwardRef } from "react";
import { HexColor, IconName } from "@/types";
import { 
    BranchSvg,
    CircleSvg,
    CornerFlowersSvg,
    DressCodeSvg,
    CeremonySvg,
    ReceptionSvg,
    LineSvg,
    QrCodeSvg,
    MusicSvg
} from "@/components/svg/svg";

export const iconsList = {
  branch: BranchSvg,
  circle: CircleSvg,
  corner_flowers: CornerFlowersSvg,
  dress_code: DressCodeSvg,
  ceremony: CeremonySvg,
  reception: ReceptionSvg,
  line: LineSvg,
  qr_code: QrCodeSvg,
  music: MusicSvg
} as const;

const Icon = forwardRef<SVGSVGElement, {
    name: IconName;
    className: string; 
    fillColor?: HexColor;
    strokeColor?: HexColor;
}>(({
    name,
    className,
    fillColor,
    strokeColor
}, ref) => {
    const Component = iconsList[name];

    if (!Component) return null;

    return (
        <Component 
            ref={ref}
            fillColor={fillColor}
            className={className}
            strokeColor={strokeColor}
        />
    )
});

export default Icon;