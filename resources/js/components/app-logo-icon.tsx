import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/logo-taspen no bg.png"
            alt="TASPEN Logo"
            className={`object-contain ${props.className || ''}`}
            width={32}
            height={32}
        />
    );
}
