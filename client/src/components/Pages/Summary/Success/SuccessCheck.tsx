/* eslint-disable max-len */
import * as React from 'react';

import { useColorTheme } from '../../../../global/contexts/Theme/ColorThemeContext';


const SvgComponent = (props) => {
  const { colorTheme } = useColorTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={90}
      height={60}
      viewBox="0 0 192 144"
      {...props}
    >
      <path
        d="M168 72c0-19.879-7.027-36.852-21.09-50.91C132.852 7.027 115.88 0 96 0 76.121 0 59.148 7.027 45.09 21.09 31.027 35.148 24 52.12 24 72c0 19.879 7.027 36.852 21.09 50.91C59.148 136.973 76.12 144 96 144c19.879 0 36.852-7.027 50.91-21.09C160.973 108.852 168 91.88 168 72"
        fill={`${colorTheme['--gradient-1']}`}
      />
      <path
        d="M96 0v144c39.766 0 72-32.234 72-72S135.766 0 96 0zm0 0"
        fill={`${colorTheme['--gradient-2']}`}
      />
      <path
        d="M85.715 103.48L54.543 72.31l10.914-10.907L85.715 81.66l38.258-38.258 10.91 10.907-49.168 49.171"
        fill="#f2f2f4"
      />
      <path
        d="M96 93.195l38.883-38.886-10.91-10.907L96 71.375v21.82"
        fill="#f2f2f4"
      />
    </svg>
  );
};

export default SvgComponent;
