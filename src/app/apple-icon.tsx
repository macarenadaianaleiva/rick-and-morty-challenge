import { ImageResponse } from 'next/og';

// Same mark as icon.tsx, at the size iOS wants for a home-screen icon.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#121316',
      }}
    >
      <div
        style={{
          width: '76%',
          height: '76%',
          borderRadius: '50%',
          display: 'flex',
          background:
            'radial-gradient(circle at 35% 30%, #d4f7ab 0%, #97ce4c 38%, #2f8f2f 72%, #1c541c 100%)',
        }}
      />
    </div>,
    { ...size },
  );
}
