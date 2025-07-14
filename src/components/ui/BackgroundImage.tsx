interface BackgroundImageProps {
  imageUrl: string;
  children: React.ReactNode;
  overlayOpacity?: number;
}

export function BackgroundImage({ 
  imageUrl, 
  children, 
  overlayOpacity = 0.4 
}: BackgroundImageProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Gradient Overlay para mejor legibilidad */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black via-black to-sirius-dark"
        style={{ opacity: overlayOpacity }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
