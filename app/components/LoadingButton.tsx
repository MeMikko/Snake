'use client';

import React from 'react';

type LoadingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  label: string;
};

export default function LoadingButton({
  loading,
  label,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button className="cta" disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="loading-indicator">
          <span className="spinner" aria-hidden />
          <span>Loading...</span>
        </span>
      ) : (
        label
      )}
    </button>
  );
}
