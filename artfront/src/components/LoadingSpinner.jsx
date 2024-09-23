import React from 'react';

const NewLoader = () => {
  const loaderStyle = {
    width: '20px',
    aspectRatio: '1',
    borderRadius: '50%',
    background: '#000',
    boxShadow: '0 0 0 0 #0004',
    animation: 'l2 1.5s infinite linear',
    position: 'relative',
  };

  const pseudoElementStyle = {
    content: '""',
    position: 'absolute',
    inset: '0',
    borderRadius: 'inherit',
    boxShadow: '0 0 0 0 #0004',
    animation: 'inherit',
  };

  return (
    <div className="loader" style={loaderStyle}>
      <style>{`
        .loader:before,
        .loader:after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: 0 0 0 0 #0004;
          animation: inherit;
        }
        .loader:before {
          animation-delay: -0.5s;
        }
        .loader:after {
          animation-delay: -1s;
        }
        @keyframes l2 {
          100% {box-shadow: 0 0 0 40px #0000}
        }
      `}</style>
    </div>
  );
};

export default NewLoader;