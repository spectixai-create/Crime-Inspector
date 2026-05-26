'use client';

interface Props {
  imageUrl: string;
  intensity?: 'normal' | 'strong';
  vignette?: boolean;
}

export function AtmosphericBackground({
  imageUrl,
  intensity = 'normal',
  vignette = true,
}: Props) {
  return (
    <div className="atmospheric-bg" aria-hidden="true">
      <div
        className="atmospheric-bg__image"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div
        className={`atmospheric-bg__overlay atmospheric-bg__overlay--${intensity}`}
      />
      {vignette && <div className="atmospheric-bg__vignette" />}
      <div className="atmospheric-bg__grain" />
    </div>
  );
}
