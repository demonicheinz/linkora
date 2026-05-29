import Image from "next/image";

export function getShapeStyle(shape?: string) {
  const commonMaskProps = {
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };

  switch (shape) {
    case "flower":
      return {
        maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='30 59 239 182'%3E%3Cellipse rx='60' ry='25' transform='matrix(1.896111 0.636211 -0.636211 1.896111 154.835958 119.904407)' fill='black'/%3E%3Cellipse rx='60' ry='25' transform='matrix(1.896111 0.636211 -0.636211 1.896111 145.164043 180.095593)' fill='black'/%3E%3C/svg%3E")`,
        WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='30 59 239 182'%3E%3Cellipse rx='60' ry='25' transform='matrix(1.896111 0.636211 -0.636211 1.896111 154.835958 119.904407)' fill='black'/%3E%3Cellipse rx='60' ry='25' transform='matrix(1.896111 0.636211 -0.636211 1.896111 145.164043 180.095593)' fill='black'/%3E%3C/svg%3E")`,
        ...commonMaskProps,
      };
    case "oval":
      return {
        maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='24 57 252 186'%3E%3Cellipse rx='130' ry='80' transform='matrix(0.939693 -0.34202 0.371009 1.019339 150 150)' fill='black'/%3E%3C/svg%3E")`,
        WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='24 57 252 186'%3E%3Cellipse rx='130' ry='80' transform='matrix(0.939693 -0.34202 0.371009 1.019339 150 150)' fill='black'/%3E%3C/svg%3E")`,
        ...commonMaskProps,
      };
    case "rounded":
      return {
        maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='225 362 1050 776'%3E%3Cpath d='M 1115.03125 1137.84375 L 384.96875 1137.84375 C 296.742188 1137.84375 225.269531 1066.371094 225.269531 978.144531 L 225.269531 521.855469 C 225.269531 433.628906 296.742188 362.15625 384.96875 362.15625 L 1115.03125 362.15625 C 1203.257812 362.15625 1274.730469 433.628906 1274.730469 521.855469 L 1274.730469 978.144531 C 1274.730469 1066.371094 1203.257812 1137.84375 1115.03125 1137.84375 Z' fill='black'/%3E%3C/svg%3E")`,
        WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='225 362 1050 776'%3E%3Cpath d='M 1115.03125 1137.84375 L 384.96875 1137.84375 C 296.742188 1137.84375 225.269531 1066.371094 225.269531 978.144531 L 225.269531 521.855469 C 225.269531 433.628906 296.742188 362.15625 384.96875 362.15625 L 1115.03125 362.15625 C 1203.257812 362.15625 1274.730469 433.628906 1274.730469 521.855469 L 1274.730469 978.144531 C 1274.730469 1066.371094 1203.257812 1137.84375 1115.03125 1137.84375 Z' fill='black'/%3E%3C/svg%3E")`,
        ...commonMaskProps,
      };
    case "burst":
      return {
        maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='40 76 220 148'%3E%3Cpath d='M88.69038,241.00184L84.4222,218.86643l-22.29495-3.16957l3.08005-21.66524-18.79864-9.27118l9.75071-19.77096-15.55242-15.77835L55.23281,134.7947L45.9591,116.59298l17.06601-8.69507-3.62639-18.80697l21.31172-4.10935l3.19215-22.45378l21.29603,3.02756l9.64039-19.54726L135.1478,56.02407l15.64108-15.41711l14.81316,15.02836l18.20554-9.27566l8.69507,17.06601l18.80697-3.62639l4.13193,21.42882l21.63009,3.07505-2.92113,20.54741l19.44083,9.5879-10.01404,20.30491l15.81575,16.04552-14.89757,14.68425l9.54542,18.73501-17.06601,8.69507l3.62638,18.80697-22.25251,4.29076-3.05247,21.47126-20.91662-2.97362-9.21869,18.69221-19.76708-9.7488-16.18279,15.95106-14.28751-14.49507-18.7312,9.54348-8.69507-17.06601-18.80695,3.62638Z' transform='matrix(1 0 0 0.671032 0 49.345203)' fill='black'/%3E%3C/svg%3E")`,
        WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='40 76 220 148'%3E%3Cpath d='M88.69038,241.00184L84.4222,218.86643l-22.29495-3.16957l3.08005-21.66524-18.79864-9.27118l9.75071-19.77096-15.55242-15.77835L55.23281,134.7947L45.9591,116.59298l17.06601-8.69507-3.62639-18.80697l21.31172-4.10935l3.19215-22.45378l21.29603,3.02756l9.64039-19.54726L135.1478,56.02407l15.64108-15.41711l14.81316,15.02836l18.20554-9.27566l8.69507,17.06601l18.80697-3.62639l4.13193,21.42882l21.63009,3.07505-2.92113,20.54741l19.44083,9.5879-10.01404,20.30491l15.81575,16.04552-14.89757,14.68425l9.54542,18.73501-17.06601,8.69507l3.62638,18.80697-22.25251,4.29076-3.05247,21.47126-20.91662-2.97362-9.21869,18.69221-19.76708-9.7488-16.18279,15.95106-14.28751-14.49507-18.7312,9.54348-8.69507-17.06601-18.80695,3.62638Z' transform='matrix(1 0 0 0.671032 0 49.345203)' fill='black'/%3E%3C/svg%3E")`,
        ...commonMaskProps,
      };
    default:
      return {};
  }
}

interface ProfileHeaderProps {
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  fontFamily?: string;
  headerLayout?: string;
  avatarShape?: string;
  titleColor?: string;
  bioColor?: string;
  pageTextColor?: string;
  wallpaperColor?: string;
}

export function ProfileHeader({
  name,
  bio,
  avatarUrl,
  bannerUrl,
  fontFamily = "inter",
  headerLayout = "classic",
  avatarShape = "flower",
  titleColor = "#FFFFFF",
  bioColor = "#AAAAAA",
  wallpaperColor = "#0C0C0C",
}: ProfileHeaderProps) {
  const fontStyle = {
    fontFamily:
      fontFamily === "inter" ? "var(--font-heading)" : "var(--font-sans)",
  };

  const isBanner = headerLayout === "banner";
  const isHero = headerLayout === "hero";
  const isShape = headerLayout === "shape";
  const avatarSize = isHero ? 112 : 104;
  const avatarClass = isHero ? "w-28 h-28" : "w-[104px] h-[104px]";

  const shapeStyle = getShapeStyle(avatarShape);

  // High-fidelity integrated Banner or Hero Header Layout
  if (isBanner || isHero) {
    const headerHeightClass = isHero ? "h-56 sm:h-64" : "h-48 sm:h-52";
    const overlapClass = isHero ? "-bottom-14" : "-bottom-12";
    const spacingPaddingClass = isHero ? "pt-6 sm:pt-8" : "pt-12";
    const coverUrl = isHero ? avatarUrl : bannerUrl;

    return (
      <div className="w-full flex flex-col items-center text-center relative">
        {/* Banner/Hero Header Wrapper (No overflow-hidden so avatar can overlap safely) */}
        <div
          className={`relative w-full ${headerHeightClass} shrink-0 bg-neutral-900 sm:rounded-t-[40px]`}
        >
          {/* Inner container for image and gradient with overflow-hidden */}
          <div className="absolute inset-0 overflow-hidden sm:rounded-t-[40px]">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={`${name}'s Header`}
                fill
                priority
                sizes="(max-width: 420px) 100vw, 420px"
                className="object-cover"
              />
            ) : (
              // Premium glassmorphism fallback gradient
              <div className="w-full h-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xs flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-widest opacity-25 font-bold font-mono">
                  Header Space
                </span>
              </div>
            )}

            {/* Immersive bottom fade gradient layer dynamically matching wallpaper color */}
            <div
              className="absolute inset-x-0 bottom-0 h-28 pointer-events-none z-10"
              style={{
                background: `linear-gradient(to bottom, transparent, ${wallpaperColor})`,
              }}
            />
          </div>

          {/* Circular Overlapping Profile Avatar with Dynamic Border Ring (Banner layout only) */}
          {!isHero && (
            <div
              className={`absolute ${overlapClass} left-1/2 -translate-x-1/2 rounded-full overflow-hidden bg-neutral-900 shadow-xl z-20 flex items-center justify-center ring-2 ring-white/10`}
              style={{
                width: avatarSize + 8,
                height: avatarSize + 8,
                border: `4px solid ${wallpaperColor}`,
              }}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={avatarSize}
                  height={avatarSize}
                  priority
                  className="object-cover w-full h-full"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-3xl font-bold"
                  style={{ ...fontStyle, color: titleColor }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Details Container (Padded to clear the overlapping avatar if present) */}
        <div className={`w-full px-6 pb-4 ${spacingPaddingClass}`}>
          <h1
            className={`font-bold tracking-wide ${isHero ? "text-3xl" : "text-2xl"}`}
            style={{ ...fontStyle, color: titleColor }}
          >
            {name}
          </h1>

          {bio && (
            <p
              className="mt-2 max-w-sm mx-auto text-sm leading-relaxed"
              style={{ ...fontStyle, color: bioColor }}
            >
              {bio}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Shape Layout (Huge Avatar -> Title -> Bio)
  if (isShape) {
    return (
      <div className="text-center w-full px-6 pt-12 pb-4 flex flex-col items-center">
        {/* Huge Avatar */}
        <div className="relative mb-2 w-full max-w-[420px] aspect-[1.35] flex-shrink-0">
          <div
            className="w-full h-full flex items-center justify-center bg-white/15 animate-fade-in relative"
            style={{ ...shapeStyle }}
          >
            <div
              className="w-[calc(100%-8px)] h-[calc(100%-8px)] overflow-hidden bg-neutral-900 flex items-center justify-center relative"
              style={{ ...shapeStyle }}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 420px) 100vw, 420px"
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-7xl font-bold"
                  style={{ ...fontStyle, color: titleColor }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <h1
          className="font-bold text-3xl sm:text-4xl tracking-tight mb-3"
          style={{ ...fontStyle, color: titleColor }}
        >
          {name}
        </h1>

        {/* Bio */}
        {bio && (
          <p
            className="max-w-sm mx-auto text-base sm:text-lg leading-relaxed"
            style={{ ...fontStyle, color: bioColor }}
          >
            {bio}
          </p>
        )}
      </div>
    );
  }

  // Classic Layout (Centered content with top spacing: Avatar -> Title -> Bio)
  return (
    <div className="text-center w-full px-6 pt-12 pb-4 flex flex-col items-center">
      <div
        className="relative mb-3"
        style={{ width: avatarSize, height: avatarSize }}
      >
        <div
          className={`${avatarClass} rounded-full border-4 border-white/10 overflow-hidden bg-white/10 mx-auto animate-fade-in relative w-full h-full`}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              priority
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-3xl font-bold"
              style={{ ...fontStyle, color: titleColor }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <h1
        className="font-bold text-2xl tracking-wide"
        style={{ ...fontStyle, color: titleColor }}
      >
        {name}
      </h1>

      {/* Bio */}
      {bio && (
        <p
          className="mt-2 max-w-sm mx-auto text-sm leading-relaxed"
          style={{ ...fontStyle, color: bioColor }}
        >
          {bio}
        </p>
      )}
    </div>
  );
}
