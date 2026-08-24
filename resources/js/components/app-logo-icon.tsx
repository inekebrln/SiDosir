import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/LOGO DOSIR.png"
            alt="SIPDosir Logo"
            className={`object-contain w-14 h-14 ${props.className || ''}`}
        />
    );
}
