/* Determines the position of the DiacriticsBankPopup */
export const handlePosition = (
  { anchorRef, setPositionRect }
  : {
    anchorRef: { current: HTMLAnchorElement },
    setPositionRect: (value: { width: number, top: number, left: number }) => void,
    isMobile?: boolean
  },
) : void => {
  const anchorRect = anchorRef.current.getBoundingClientRect();
  setPositionRect({ width: anchorRect.width, top: anchorRect.height + 20, left: 0 });
};

/* Handles opening the DiacriticsBankPopup */
export const handleIsEditing = ({
  e,
  anchorRef,
  accentedLetterPopupRef,
  setPositionRect,
  isMobile,
  setIsVisible,
}: {
  e: { target: HTMLElement },
  anchorRef: { current: HTMLAnchorElement },
  accentedLetterPopupRef: { current: HTMLAnchorElement },
  setPositionRect: () => void,
  isMobile: boolean,
  setIsVisible: (value: boolean) => void,
}) : void => {
  setIsVisible(
    e.target.isEqualNode(anchorRef.current)
    || accentedLetterPopupRef.current?.contains(e.target)
    || accentedLetterPopupRef.current?.isEqualNode(e.target),
  );

  if (!accentedLetterPopupRef.current?.contains(e.target)
    && !accentedLetterPopupRef.current?.isEqualNode(e.target)) {
    handlePosition({ anchorRef, setPositionRect, isMobile });
  }
};
