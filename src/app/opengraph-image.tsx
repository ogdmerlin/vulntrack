import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'VulnTrack - Advanced Vulnerability Management'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #000000, #111111)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {/* Shield Icon from favicon/logo.svg */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="128"
                        height="128"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </svg>
                    <div
                        style={{
                            fontSize: 128,
                            fontWeight: 'bold',
                            color: 'white',
                            letterSpacing: '-0.05em',
                        }}
                    >
                        VulnTrack
                    </div>
                </div>
                <div
                    style={{
                        marginTop: '32px',
                        fontSize: 48,
                        color: '#a1a1aa',
                        letterSpacing: '-0.025em',
                    }}
                >
                    Advanced Vulnerability Management
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
