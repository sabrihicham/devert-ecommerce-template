interface StoreBannerProps {
  text: string;
}

export function StoreBanner({ text }: StoreBannerProps) {
  return (
    <div className="w-full bg-violet-600 px-4 py-2.5 text-center text-sm font-medium text-white">
      {text}
    </div>
  );
}
