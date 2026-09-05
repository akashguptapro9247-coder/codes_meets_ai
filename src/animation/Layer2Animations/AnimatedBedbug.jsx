import React from 'react';

function AnimatedBedbug({ className = '', style = {} }) {
  return (
    <>
      <style>{`
        .animated-bedbug-container {
          position: relative;
          user-select: none;
          pointer-events: none;
        }

        .bedbug-leg-left-1, .bedbug-leg-left-2, .bedbug-leg-left-3,
        .bedbug-leg-right-1, .bedbug-leg-right-2, .bedbug-leg-right-3 {
          transform-box: fill-box;
          animation-duration: 0.38s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        .bedbug-leg-left-1 { transform-origin: 85% 85%; }
        .bedbug-leg-left-2 { transform-origin: 85% 50%; }
        .bedbug-leg-left-3 { transform-origin: 85% 15%; }

        .bedbug-leg-right-1 { transform-origin: 15% 85%; }
        .bedbug-leg-right-2 { transform-origin: 15% 50%; }
        .bedbug-leg-right-3 { transform-origin: 15% 15%; }

        .bedbug-leg-left-1, .bedbug-leg-right-2, .bedbug-leg-left-3 {
          animation-name: bedbugLegGroupA;
        }

        .bedbug-leg-right-1, .bedbug-leg-left-2, .bedbug-leg-right-3 {
          animation-name: bedbugLegGroupB;
        }

        @keyframes bedbugLegGroupA {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }

        @keyframes bedbugLegGroupB {
          0%, 100% { transform: rotate(8deg); }
          50% { transform: rotate(-8deg); }
        }

        .bedbug-antenna {
          transform-box: fill-box;
          animation-duration: 1.1s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        .bedbug-antenna-left {
          transform-origin: 75% 85%;
          animation-name: bedbugAntennaLeft;
        }

        .bedbug-antenna-right {
          transform-origin: 25% 85%;
          animation-name: bedbugAntennaRight;
        }

        @keyframes bedbugAntennaLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-7deg); }
        }

        @keyframes bedbugAntennaRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(7deg); }
        }
      `}</style>
      <div className={`animated-bedbug-container ${className}`} style={{ width: 60, height: 60, display: 'inline-block', ...style }}>
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          xmlSpace="preserve"
        >
          <g>
            {/* LEGS & ANTENNAE */}
            <g className="bedbug-limbs">
              {/* Right Hind Leg (bedbug-leg-right-3) */}
              <path
                className="bedbug-leg bedbug-leg-right-3"
                style={{ fill: '#2F7F42' }}
                d="M498.975,512c-1.458,0-2.942-0.365-4.296-1.146l-60.746-34.712c-2.1-1.198-3.61-3.22-4.157-5.58
                  L404.55,361.212l-92.464-58.837c-4.044-2.577-5.241-7.94-2.664-11.984c2.577-4.035,7.932-5.224,11.984-2.664l95.458,60.746
                  c1.918,1.224,3.28,3.159,3.801,5.372l25.175,109.117l57.448,32.829c4.165,2.378,5.615,7.68,3.228,11.837
                  C504.919,510.43,501.995,512,498.975,512"
              />
              {/* Right Middle Leg (bedbug-leg-right-2) */}
              <path
                className="bedbug-leg bedbug-leg-right-2"
                style={{ fill: '#2F7F42' }}
                d="M316.737,277.695c-4.365,0-8.131-3.28-8.617-7.723c-0.529-4.756,2.907-9.051,7.671-9.58
                  l74.084-8.227l32.464-48.709c1.605-2.412,4.322-3.862,7.22-3.862h60.746c4.799,0,8.678,3.888,8.678,8.678
                  s-3.879,8.678-8.678,8.678h-56.103l-32.135,48.206c-1.423,2.126-3.714,3.523-6.265,3.81l-78.102,8.678
                  C317.379,277.678,317.05,277.695,316.737,277.695"
              />
              {/* Right Front Leg (bedbug-leg-right-1) */}
              <path
                className="bedbug-leg bedbug-leg-right-1"
                style={{ fill: '#2F7F42' }}
                d="M316.755,251.661c-2.734,0-5.432-1.284-7.116-3.705c-2.751-3.922-1.796-9.329,2.135-12.08
                  l83.074-58.16v-64.903c0-3.046,1.605-5.875,4.209-7.437l43.39-26.034c4.113-2.473,9.442-1.137,11.906,2.968
                  c2.473,4.113,1.137,9.442-2.968,11.906l-39.181,23.509v64.512c0,2.829-1.38,5.484-3.705,7.107l-86.78,60.746
                  C320.208,251.149,318.473,251.661,316.755,251.661"
              />
              {/* Left Hind Leg (bedbug-leg-left-3) */}
              <path
                className="bedbug-leg bedbug-leg-left-3"
                style={{ fill: '#2F7F42' }}
                d="M13.026,512c-3.02,0-5.944-1.571-7.541-4.374c-2.386-4.157-0.937-9.459,3.228-11.837l57.448-32.829
                  l25.175-109.117c0.521-2.213,1.883-4.148,3.801-5.372l95.458-60.746c4.07-2.577,9.416-1.371,11.984,2.664
                  c2.577,4.044,1.38,9.407-2.664,11.984l-92.464,58.837L82.224,470.563c-0.547,2.36-2.057,4.382-4.157,5.58l-60.746,34.712
                  C15.968,511.636,14.484,512,13.026,512"
              />
              {/* Left Antenna */}
              <path
                className="bedbug-antenna bedbug-antenna-left"
                style={{ fill: '#2F7F42' }}
                d="M221.288,173.56c-4.799,0-8.678-3.888-8.678-8.678c0-52.562-91.197-125.379-126.334-149.001
                  c-3.983-2.673-5.033-8.071-2.36-12.045c2.673-3.975,8.071-5.033,12.045-2.36c5.467,3.679,134.005,90.919,134.005,163.406
                  C229.966,169.672,226.087,173.56,221.288,173.56"
              />
              {/* Right Antenna */}
              <path
                className="bedbug-antenna bedbug-antenna-right"
                style={{ fill: '#2F7F42' }}
                d="M290.712,173.56c-4.799,0-8.678-3.888-8.678-8.678c0-72.487,128.538-159.727,134.005-163.406
                  c3.974-2.673,9.363-1.614,12.045,2.36c2.673,3.975,1.623,9.364-2.36,12.045c-1.267,0.85-126.334,85.712-126.334,149.001
                  C299.39,169.672,295.511,173.56,290.712,173.56"
              />
              {/* Left Middle Leg (bedbug-leg-left-2) */}
              <path
                className="bedbug-leg bedbug-leg-left-2"
                style={{ fill: '#2F7F42' }}
                d="M195.263,277.695c-0.321,0-0.642-0.017-0.963-0.052l-78.102-8.678
                  c-2.551-0.286-4.842-1.684-6.265-3.81L77.798,216.95H21.695c-4.799,0-8.678-3.888-8.678-8.678s3.879-8.678,8.678-8.678h60.746
                  c2.898,0,5.615,1.449,7.22,3.862l32.464,48.709l74.084,8.227c4.764,0.529,8.201,4.825,7.671,9.58
                  C203.394,274.415,199.628,277.695,195.263,277.695"
              />
              {/* Left Front Leg (bedbug-leg-left-1) */}
              <path
                className="bedbug-leg bedbug-leg-left-1"
                style={{ fill: '#2F7F42' }}
                d="M195.246,251.661c-1.718,0-3.445-0.512-4.964-1.571l-86.78-60.746
                  c-2.326-1.623-3.705-4.278-3.705-7.107v-64.512L60.616,94.217c-4.105-2.465-5.441-7.793-2.968-11.906
                  c2.465-4.105,7.784-5.441,11.906-2.968l43.39,26.034c2.603,1.562,4.209,4.391,4.209,7.437v64.903l83.074,58.16
                  c3.931,2.751,4.886,8.157,2.135,12.08C200.678,250.377,197.979,251.661,195.246,251.661"
              />
            </g>

            {/* ABDOMEN & HEAD */}
            <path
              style={{ fill: '#3B9B54' }}
              d="M308.068,199.594H256h-52.068c0,0-36.803,130.152,42.14,246.593c4.738,6.986,15.117,6.986,19.855,0
                C344.871,329.746,308.068,199.594,308.068,199.594"
            />
            <path
              style={{ fill: '#2F7F42' }}
              d="M308.068,199.594H203.932l1.545-9.268c4.113-24.697,25.479-42.8,50.523-42.8
                c25.045,0,46.41,18.102,50.523,42.8L308.068,199.594z"
            />
          </g>
        </svg>
      </div>
    </>
  );
}

export default AnimatedBedbug;
