import { ImageResponse } from 'next/og';

// An original portal graphic (not the show's trademarked logo artwork),
// reusing the app's own brand colors.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#121316',
        borderRadius: '50%',
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
