import { Toaster } from 'react-hot-toast';
import React from 'react';
const CustomToaster=()=>{
    return (
           <Toaster
  toastOptions={{
    style: {
      fontSize: '1.1rem',       // make text bigger
      padding: '16px 24px',     // add spacing
      minWidth: '300px'         // optional: widen box
    },
    success: {
      iconTheme: {
        primary: '#4ade80',     // green
        secondary: '#f0fdf4',
      }
    },
    error: {
      iconTheme: {
        primary: '#f87171',     // red
        secondary: '#fef2f2',
      }
    },
  }}
/>
    );
}
export default CustomToaster;