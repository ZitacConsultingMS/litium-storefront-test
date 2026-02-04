const CircleCheckMark = ({
  ariaHidden = true,
  focusable = false,
  ...props
}) => {
  return (
    <svg
      x="0px"
      y="0px"
      viewBox="0 0 24 24"
      aria-hidden={ariaHidden}
      focusable={focusable}
      {...props}
    >
      <path
        d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z"
        fillRule="nonzero"
        fill="#53CF06"
        stroke="none"
      />
    </svg>
  );
};

export default CircleCheckMark;
