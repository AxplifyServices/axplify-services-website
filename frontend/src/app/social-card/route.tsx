import {
  ImageResponse,
} from 'next/og';

export const runtime =
  'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width:
            '100%',

          height:
            '100%',

          display:
            'flex',

          position:
            'relative',

          overflow:
            'hidden',

          background:
            '#05264f',

          color:
            '#ffffff',

          fontFamily:
            'Arial, Helvetica, sans-serif',
        }}
      >
        {/* Halo cyan */}
        <div
          style={{
            position:
              'absolute',

            width:
              520,

            height:
              520,

            borderRadius:
              9999,

            background:
              'rgba(28, 182, 220, 0.18)',

            top:
              -210,

            right:
              -100,
          }}
        />

        {/* Halo violet */}
        <div
          style={{
            position:
              'absolute',

            width:
              460,

            height:
              460,

            borderRadius:
              9999,

            background:
              'rgba(139, 92, 246, 0.18)',

            bottom:
              -260,

            left:
              350,
          }}
        />

        {/* Élément décoratif */}
        <div
          style={{
            position:
              'absolute',

            right:
              72,

            bottom:
              72,

            width:
              230,

            height:
              230,

            border:
              '2px solid rgba(28, 182, 220, 0.42)',

            borderRadius:
              48,

            transform:
              'rotate(14deg)',
          }}
        />

        <div
          style={{
            position:
              'absolute',

            right:
              110,

            bottom:
              112,

            width:
              150,

            height:
              150,

            border:
              '2px solid rgba(139, 92, 246, 0.55)',

            borderRadius:
              36,

            transform:
              'rotate(-8deg)',
          }}
        />

        {/* Contenu */}
        <div
          style={{
            display:
              'flex',

            flexDirection:
              'column',

            justifyContent:
              'space-between',

            width:
              '100%',

            padding:
              '72px 78px',
          }}
        >
          <div
            style={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                18,
            }}
          >
            <div
              style={{
                width:
                  18,

                height:
                  18,

                borderRadius:
                  9999,

                background:
                  '#1cb6dc',
              }}
            />

            <div
              style={{
                display:
                  'flex',

                fontSize:
                  27,

                fontWeight:
                  700,

                letterSpacing:
                  '0.06em',
              }}
            >
              AXPLIFY SERVICES
            </div>
          </div>

          <div
            style={{
              display:
                'flex',

              flexDirection:
                'column',

              maxWidth:
                820,

              gap:
                26,
            }}
          >
            <div
              style={{
                display:
                  'flex',

                fontSize:
                  67,

                lineHeight:
                  1.03,

                letterSpacing:
                  '-0.045em',

                fontWeight:
                  800,
              }}
            >
              Transformez vos obstacles en leviers de croissance digitale.
            </div>

            <div
              style={{
                display:
                  'flex',

                maxWidth:
                  770,

                color:
                  '#cbecff',

                fontSize:
                  27,

                lineHeight:
                  1.4,
              }}
            >
              Digital · Data · Intelligence artificielle · Automatisation
            </div>
          </div>

          <div
            style={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                18,

              fontSize:
                21,

              color:
                '#b1cedd',
            }}
          >
            <span>
              De votre besoin
            </span>

            <span
              style={{
                color:
                  '#1cb6dc',

                fontSize:
                  28,
              }}
            >
              →
            </span>

            <span>
              à une solution concrète
            </span>
          </div>
        </div>
      </div>
    ),

    {
      width:
        1200,

      height:
        630,

      headers: {
        'Cache-Control':
          'public, max-age=86400, s-maxage=86400',
      },
    },
  );
}