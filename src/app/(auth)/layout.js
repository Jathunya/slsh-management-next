import { HouseHeartIcon } from "@/components/shared/HouseHeartIcon";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <HouseHeartIcon size={24} />
          </div>
          <h1 className="text-lg font-semibold text-foreground">SLSH</h1>
          <p className="text-sm text-muted">Smooth · Live · Sweet · Home</p>
        </div>
        {children}
      </div>
    </div>
  );
}
