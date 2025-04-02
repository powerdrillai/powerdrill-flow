type IconProps = React.HTMLAttributes<SVGElement>;

export function LoadingDots(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="12" r="3">
        <animate
          attributeName="cy"
          values="12;6;12;12"
          keyTimes="0;0.286;0.571;1"
          dur="1.05s"
          repeatCount="indefinite"
          keySplines=".33,0,.66,.33;.33,.66,.66,1"
        />
      </circle>
      <circle cx="12" cy="12" r="3">
        <animate
          attributeName="cy"
          values="12;6;12;12"
          keyTimes="0;0.286;0.571;1"
          dur="1.05s"
          repeatCount="indefinite"
          keySplines=".33,0,.66,.33;.33,.66,.66,1"
          begin="0.1s"
        />
      </circle>
      <circle cx="20" cy="12" r="3">
        <animate
          attributeName="cy"
          values="12;6;12;12"
          keyTimes="0;0.286;0.571;1"
          dur="1.05s"
          repeatCount="indefinite"
          keySplines=".33,0,.66,.33;.33,.66,.66,1"
          begin="0.2s"
        />
      </circle>
    </svg>
  );
}
