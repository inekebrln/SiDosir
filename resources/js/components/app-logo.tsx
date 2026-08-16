import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-12 sm:size-14 items-center justify-center bg-transparent shrink-0">
                <AppLogoIcon className="w-full h-full" />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate leading-tight font-bold text-white text-base tracking-wide">
                    SIPDosir
                </span>
                <span className="truncate text-[9px] font-semibold text-taspen-gold tracking-widest leading-none mt-0.5">
                    TASPEN PERSERO
                </span>
            </div>
        </>
    );
}
