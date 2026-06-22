import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-white text-[#003087] shadow-sm shrink-0">
                <AppLogoIcon className="size-5 fill-current text-[#003087]" />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate leading-tight font-bold text-white text-base tracking-wide">
                    SiDosir
                </span>
                <span className="truncate text-[9px] font-semibold text-taspen-gold tracking-widest leading-none mt-0.5">
                    TASPEN PERSERO
                </span>
            </div>
        </>
    );
}
