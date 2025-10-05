import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z"
      />
      <path
        fill="currentColor"
        d="M187.56 68.44a88.11 88.11 0 0 0-119.12 0L128 128Z"
        opacity={0.2}
      />
      <path
        fill="currentColor"
        d="m164.71 160.29-36.87-41.13-36.42 41.13a64 64 0 0 1 73.29 0Z"
      />
    </svg>
  );
}
