export const operationalMotion = {
  // General surface changes.
  surface:
    "transition-[background-color,border-color,box-shadow,color,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",

  // Content entering the interface.
  fadeIn: "animate-[georgeFadeIn_240ms_cubic-bezier(0.22,1,0.36,1)_both]",

  fadeInSoft:
    "animate-[georgeFadeInSoft_320ms_cubic-bezier(0.22,1,0.36,1)_both]",

  // Menus and surfaces opening below an owner.
  collapseDown:
    "animate-[georgeCollapseDown_280ms_cubic-bezier(0.22,1,0.36,1)_both] origin-top",

  // Surfaces opening upward from the composer or lower controls.
  collapseUp:
    "animate-[georgeCollapseUp_280ms_cubic-bezier(0.22,1,0.36,1)_both] origin-bottom",

  // Workspace transitions.
  slideIn: "animate-[georgeSlideIn_320ms_cubic-bezier(0.22,1,0.36,1)_both]",

  // Mechanical button travel rather than bouncing.
  press:
    "active:translate-y-px active:scale-[0.99] transition-transform duration-150 ease-out",

  softPress:
    "active:translate-y-px active:scale-[0.995] transition-transform duration-150 ease-out",

  hoverText: "transition-colors duration-200 ease-out hover:text-white",

  anchorPanel:
    "rounded-[1.05rem] border border-white/[0.07] bg-[#05080D]/88 shadow-[0_22px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl",

  lightsOut:
    "bg-black/52 backdrop-blur-[14px] transition-[opacity,backdrop-filter] duration-300 ease-out",
} as const;
