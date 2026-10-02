import { alpha, type Theme } from '@mui/material'

import { primary } from '@configs/colors'
import {
  ExpandMoreIcon,
  NavigateBeforeIcon,
  NavigateNextIcon
} from '@configs/icons'

import { LinkBehavior } from 'components/atoms/LinkBehavior'

import { toRem } from 'utils/theme'

export type ThemeProps = {
  theme: Theme
}

// the text field look, also worn by the date and time picker fields (MuiPickersTextField)
const textFieldRoot = ({ theme }: ThemeProps) =>
  theme.sx({
    '& .MuiInputBase-input': {
      lineHeight: toRem(24)
    },
    '& .MuiFormLabel-root': {
      px: 1,
      borderRadius: 1,
      color: 'text.hint',
      bgcolor: 'background.paper',
      fontSize: toRem(16),
      lineHeight: toRem(24),
      transform: 'translate(8px, 12px) scale(1)'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: 1,
      borderColor: 'divider'
    },
    '& legend': {
      fontSize: toRem(12)
    },
    [['& .MuiInputLabel-root.Mui-focused', '& .MuiInputLabel-shrink'].join(
      ','
    )]: {
      transform: 'translate(9px,-8px) scale(0.75)'
    },
    '& .MuiInputBase-root .MuiInputBase-input.MuiSelect-select': {
      py: 1.5
    }
  })

/**
 * MUI theme component overrides. Each key is an MUI component whose default
 * `defaultProps` and `styleOverrides` are customized here to match the design
 * system (spacing, radii, colors pulled from the palette via `theme.sx`).
 *
 * A tenant customizes a component by spreading this default in its own
 * `theme/components.ts` and overriding only the specific component keys that
 * differ; brand colors flow through automatically via `@configs/colors`.
 */
const components = {
  /** Global CSS baseline — sets the document-wide default line height. */
  MuiCssBaseline: {
    styleOverrides: {
      lineHeight: 1.75
    }
  },
  /**
   * Any button-like surface (Button, IconButton, MenuItem, …) with an `href` navigates
   * through next/link via LinkBehavior — so call sites use plain `href` instead of
   * `component={Link}` (a function prop that breaks RSC prerender in Next 16).
   */
  MuiButtonBase: {
    defaultProps: {
      LinkComponent: LinkBehavior
    }
  },
  /** Typography — defaults text to `text.primary` and adds bottom spacing for `gutterBottom`. */
  MuiTypography: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          color: 'text.primary'
        }),
      gutterBottom: ({ theme }: ThemeProps) =>
        theme.sx({
          pb: 2
        })
    }
  },
  /** Links — underline only on hover, inheriting the surrounding text color. */
  MuiLink: {
    defaultProps: {
      underline: 'hover' as const,
      component: LinkBehavior
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) => ({
        fontFamily: theme.typography.fontFamily,
        color: 'inherit',
        textDecorationColor: 'inherit'
      })
    }
  },
  /** App bar (header) — white surface, black text, flat with a soft shadow. */
  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          bgcolor: 'common.white',
          color: 'common.black',
          position: 'relative',
          borderRadius: 0,
          boxShadow: '0 0 35px #A1A1A126'
        })
    }
  },
  /** Stack — use CSS flex `gap` for spacing instead of margin hacks. */
  MuiStack: {
    defaultProps: {
      useFlexGap: true
    }
  },
  /** Menu — keep page scroll enabled while the menu is open (no scroll lock). */
  MuiMenu: {
    defaultProps: {
      disableScrollLock: true
    }
  },
  /** Menu items — normalize font size to 16px. */
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          fontSize: toRem(16)
        })
    }
  },
  /** Button group — flat, rounded container with white dividers between segments; selected/contained uses `primary.main`. */
  MuiButtonGroup: {
    defaultProps: {
      disableElevation: true
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          borderRadius: 1,
          color: 'common.black',
          bgcolor: 'common.white',
          border: 0,

          '& .MuiButton-outlined': {
            border: '0 !important'
          },

          '& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton': {
            borderColor: 'transparent',
            backgroundClip: 'padding-box',

            '&::after': {
              content: '""',
              position: 'absolute',
              top: 12,
              right: -1,
              bottom: 12,
              borderRight: 1,
              borderColor: 'common.white'
            }
          },

          [[
            '& .MuiButtonGroup-groupedVertical.MuiButtonGroup-firstButton',
            '& .MuiButtonGroup-groupedVertical.MuiButtonGroup-middleButton'
          ].join(',')]: {
            '&::after': {
              content: '""',
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 0,
              borderRight: 0,
              borderBottom: 1,
              borderColor: 'common.white'
            }
          }
        }),
      contained: ({ theme }: ThemeProps) =>
        theme.sx({
          color: 'common.white',
          bgcolor: 'primary.main'
        })
    }
  },
  /** Button — flat, rounded, fixed 48px height by default; `sizeLarge`/`sizeSmall` adjust padding and font size. */
  MuiButton: {
    defaultProps: {
      disableElevation: true,
      disableFocusRipple: true
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          p: 2,
          height: 48,
          borderRadius: 1,

          '&.MuiButton-contained': {
            '& svg path': { fill: 'currentColor' },
            '&.Mui-disabled.MuiButton-loading': {
              color: 'transparent'
            }
          },
          '& .MuiButton-loadingIndicator': {
            color: 'white'
          }
        }),
      sizeLarge: ({ theme }: ThemeProps) =>
        theme.sx({
          px: 3,
          py: 2,
          height: 'auto',
          fontSize: toRem(18),
          lineHeight: toRem(20)
        }),
      sizeSmall: ({ theme }: ThemeProps) =>
        theme.sx({
          px: 2,
          py: 1,
          height: 38,
          fontSize: toRem(14),
          lineHeight: toRem(20)
        })
    }
  },
  /** Toggle button group — flat, rounded container with white segment dividers; primary color tints the dividers. */
  MuiToggleButtonGroup: {
    defaultProps: {
      // disableElevation: true
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          border: 0,
          borderRadius: 1,
          maxHeight: 48,
          color: 'text.primary',
          bgcolor: 'background.default',

          /* styles for the button BEFORE the selected one */
          '& .MuiToggleButton-standard:has(+ .Mui-selected)': {
            '&::after': {
              display: 'none'
            }
          },
          '& .MuiToggleButtonGroup-firstButton, & .MuiToggleButtonGroup-middleButton':
            {
              borderColor: 'transparent',
              backgroundClip: 'padding-box',

              '&::after': {
                content: '""',
                position: 'absolute',
                top: 12,
                right: 0,
                bottom: 12,
                borderRight: 1,
                borderColor: 'common.white'
              }
            }
        }),
      contained: ({ theme }: ThemeProps) =>
        theme.sx({
          color: 'common.white',
          bgcolor: 'primary.main'
        }),
      colorPrimary: ({ theme }: ThemeProps) =>
        theme.sx({
          '& .MuiToggleButtonGroup-firstButton, & .MuiToggleButtonGroup-middleButton':
            {
              '&::after': {
                borderColor: alpha(theme.palette.primary.main, 0.12)
              }
            }
        })
    }
  },
  /** Toggle button — flat, rounded; selected state fills with `primary.main` and inverts text/icon to white. */
  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          p: 2,
          maxHeight: 48,
          border: 0,
          borderRadius: 1,
          color: 'common.black',

          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08)
          },

          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'common.white',

            '& svg path': { fill: 'currentColor' },
            '&::after': { display: 'none' },
            '&:hover': { bgcolor: 'primary.dark' }
          }
        }),
      sizeLarge: ({ theme }: ThemeProps) =>
        theme.sx({
          px: 3,
          py: 2,
          height: 'auto',
          fontSize: toRem(16),
          lineHeight: toRem(20)
        }),
      sizeSmall: ({ theme }: ThemeProps) =>
        theme.sx({
          px: 2,
          py: 1,
          border: 0,
          height: 'auto',
          fontSize: toRem(14),
          lineHeight: toRem(20)
        })
    }
  },
  /** Select — custom chevron icon, rounded, divider-colored border, primary focus ring. */
  // MUI draws pagination arrows from its own bundled glyphs, bypassing the icon
  // registry. Routing them through the registry keeps a tenant's chevrons in one
  // place; for tenants that don't override the slots this resolves to the same
  // MUI icons it drew before.
  MuiPaginationItem: {
    defaultProps: {
      slots: { previous: NavigateBeforeIcon, next: NavigateNextIcon }
    }
  },
  MuiSelect: {
    defaultProps: {
      IconComponent: ExpandMoreIcon
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          py: 0,
          px: 1,
          maxHeight: 48,
          lineHeight: 1,
          borderRadius: 1,
          borderColor: 'transparent',
          '&.MuiOutlinedInput-root': {
            px: 0
          },
          '& .MuiSelect-select': {
            pr: '22px !important'
          },
          '&::before, &::after': {
            display: 'none'
          },
          '&.Mui-focused::after': {
            content: '""',
            inset: 0,
            border: 2,
            display: 'block',
            borderRadius: 1,
            position: 'absolute',
            borderColor: 'primary.main'
          },
          '& .MuiInput-input:focus, & .MuiFilledInput-input:focus': {
            background: 'transparent'
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider'
          },
          '&.MuiInputBase-outlined': {
            borderColor: 'divider'
          }
        }),

      select: ({ theme }: ThemeProps) =>
        theme.sx({
          minHeight: 0,
          py: 2
        }),
      multiple: ({ theme }: ThemeProps) =>
        theme.sx({
          minHeight: 0,
          lineHeight: 1,
          py: 2,

          '&.MuiSelect-outlined': {
            lineHeight: toRem(14),
            border: 1,
            borderColor: 'divider'
          }
        }),

      icon: ({ theme }: ThemeProps) =>
        theme.sx({
          fontSize: 22,
          color: 'primary.main'
        })
    }
  },
  /** Input adornment — hint-colored, matches the input's default background. */
  MuiInputAdornment: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          px: 0,
          color: 'text.hint',
          bgcolor: 'background.default'
        })
    }
  },
  /** Standard input — 16px text with comfortable line height. */
  MuiInput: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          fontSize: toRem(16),
          lineHeight: toRem(24)
        })
    }
  },
  /** Autocomplete — padded field and dropdown; options tint with primary on hover/focus. */
  MuiAutocomplete: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          '& .MuiInputBase-root': {
            p: 0,
            '& .MuiInputBase-input': {
              p: 2,
              height: 16,
              lineHeight: toRem(16)
            }
          },
          '& .MuiAutocomplete-clearIndicator': {
            color: 'primary.main'
          }
        }),
      popper: ({ theme }: ThemeProps) =>
        theme.sx({
          '& .MuiAutocomplete-listbox': {
            pb: 0,
            '& .MuiAutocomplete-option': {
              px: 1,
              pt: 0,
              pb: 1
            },
            '& .MuiAutocomplete-option:hover, & .MuiAutocomplete-option.Mui-focused':
              {
                bgcolor: 'background.paper',
                '& > *': {
                  bgcolor: alpha(primary, 0.1),
                  color: 'primary.dark'
                }
              }
          }
        })
    }
  },
  /** Filled input — no underline, rounded, subtle background that tints with primary on hover/focus. */
  MuiFilledInput: {
    defaultProps: {
      disableUnderline: true
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          p: 0,
          borderRadius: 1,
          bgcolor: 'background.default',

          '&.Mui-disabled': {
            bgcolor: 'background.default'
          },

          '&.MuiInputBase-colorPrimary': {
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08)
            },

            '&.Mui-focused': {
              bgcolor: alpha(theme.palette.primary.main, 0.12)
            }
          }
        })
    }
  },
  /** Skeleton — wave animation; rounded variant uses the default background. */
  MuiSkeleton: {
    defaultProps: {
      animation: 'wave' as const // weird type fixes because MUI misses type declarations
    },
    styleOverrides: {
      rounded: ({ theme }: ThemeProps) =>
        theme.sx({
          borderRadius: 1,
          bgcolor: 'background.default'
        })
    }
  },
  /** Paper — rounded surface with clipped overflow; base for cards, menus, popovers. */
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          overflow: 'hidden',
          borderRadius: 2
        })
    }
  },
  /** Divider — divider-colored line with small vertical margin. */
  MuiDivider: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          borderColor: 'divider',
          my: 0.5
        })
    }
  },
  /** Tooltip — compact, centered; links inside are always underlined (hover-underline never fires on touch). */
  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }: ThemeProps) =>
        theme.sx({
          p: 1,
          textAlign: 'center',
          fontSize: toRem(14),
          // Links inside tooltips read as interactive — always underline them
          // (the global MuiLink default only underlines on hover, which never
          // fires on touch).
          '& .MuiLink-root': { textDecoration: 'underline' }
        })
    }
  },
  /** Tabs — remove the leading margin on the first tab. */
  MuiTabs: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          '& .MuiButtonBase-root:first-child': {
            ml: 0
          }
        })
    }
  },
  /** Tab — uniform padding and line height. */
  MuiTab: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          p: 2,
          lineHeight: toRem(32)
        })
    }
  },
  /** Input base — shared padding/sizing for all inputs; includes small-size and secondary-color variants. */
  MuiInputBase: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          '& input, & textarea': {
            p: 2,
            py: 1.5,
            height: 'auto',
            fontSize: toRem(16),
            lineHeight: toRem(24)
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E9E9E9 !important'
          },
          '& .MuiInputAdornment-root': {
            bgcolor: 'transparent'
          },
          // A clear button ending the field keeps (48px field − 36px button) / 2 = 6px to
          // the right edge, as to the top and bottom: MUI's 14px end padding less 8px.
          // It ends a filled field as its last child, an outlined one right before the
          // notched outline MUI renders after the end adornment.
          '& > .MuiIconButton-root:is(:last-child, :has(+ .MuiOutlinedInput-notchedOutline))':
            { mr: -1 },

          '&.MuiFilledInput-root .MuiInputAdornment-root.MuiInputAdornment-positionStart':
            {
              mt: '0 !important',
              ml: 2,
              mr: 0
            },

          '&.MuiInputBase-multiline': {
            p: 0
          },
          '&.MuiInputBase-sizeSmall': {
            px: 0.5,
            maxHeight: 38,
            '& .MuiInputBase-input': {
              py: 1.5,
              fontSize: toRem(14)
            }
          },
          '&.MuiInputBase-colorSecondary': {
            '& .MuiInputBase-input': {
              // color: 'secondary.main'
            },

            '& .MuiFormLabel-root': {
              color: 'secondary.light'
            },

            '&.Mui-focused::after': {
              borderColor: 'secondary.main'
            },

            '& .MuiOutlinedInput-notchedOutline': {
              border: 1,
              borderColor: 'secondary.light'
            },

            '& .MuiSvgIcon-root': {
              color: 'secondary.main'
            }
          }
        }),

      input: ({ theme }: ThemeProps) =>
        theme.sx({
          fontSize: toRem(16)
        })
    }
  },

  /** Text field — rounded outline, hint-colored floating label with custom shrink transform. */
  MuiTextField: {
    styleOverrides: {
      root: textFieldRoot
    }
  },
  /** Dialog — no scroll lock, fixed elevation, no open/close transition, paper-scroll mode. */
  MuiDialog: {
    defaultProps: {
      disableScrollLock: true,
      // keepMounted: true,
      elevation: 3,
      TransitionComponent: undefined,
      scroll: 'paper' as const // weird type fixes because MUI misses type declarations
    },
    styleOverrides: {
      // MUI focuses the paper on open; dialogs that open without user
      // interaction (cookie consent, rebrand notice) then match
      // :focus-visible and get the UA blue ring — MUI only suppresses it
      // on the container, its legacy focus target.
      paper: { outline: 0 }
    }
  },
  /** Dialog title — centered, responsive padding, 24px heading size. */
  MuiDialogTitle: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 8, sm: 12 },
          textAlign: 'center',
          fontSize: toRem(24),
          lineHeight: toRem(32)
        })
    }
  },
  /** Dialog content — responsive padding, thin scrollbar. */
  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          py: 2,
          px: { xs: 2, sm: 4, md: 8 },
          scrollbarWidth: 'thin'
        })
    }
  },
  /** Dialog actions — centered buttons; tinted footer background on small screens. */
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          justifyContent: 'center',
          bgcolor: { xs: 'background.default', sm: 'background.paper' },
          pt: { xs: 2, sm: 2 },
          pb: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 4, md: 8 }
        })
    }
  },
  /** Drawer — retunes nested dialog title/content/actions spacing for the slide-out panel layout. */
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }: ThemeProps) =>
        theme.sx({
          '& .MuiDialogTitle-root': {
            py: 2
          },

          '& .MuiDialogContent-root': {
            py: 0,
            px: { xs: 2, sm: 4 }
          },

          '& .MuiDialogActions-root': {
            py: 2,
            px: { xs: 2, md: 4 },
            bgcolor: 'background.default'
          }
        })
    }
  },
  /** Popover — soft shadow and rounded corners on its paper surface. */
  MuiPopover: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          '& .MuiPaper-root': {
            boxShadow: 1,
            borderRadius: 1
          }
        })
    }
  },
  /** Popper — soft shadow and rounded corners on its paper surface. */
  MuiPopper: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          '& .MuiPaper-root': {
            boxShadow: 1,
            borderRadius: 1
          }
        })
    }
  },
  /** Calendar day — the v8 MuiPickersPopper paper slot no longer reaches the calendar, so size the day component directly. */
  MuiPickersDay: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          fontSize: toRem(14)
        })
    }
  },
  /** Calendar weekday header — same readable size as the day cells. */
  MuiDayCalendar: {
    styleOverrides: {
      weekDayLabel: ({ theme }: ThemeProps) =>
        theme.sx({
          fontSize: toRem(14)
        })
    }
  },
  /** Picker layout — the action bar renders as MuiDialogActions and would inherit the modal's wide side padding, stretching the popper and leaving an empty grid column; keep it compact. */
  MuiPickersLayout: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          '& .MuiPickersLayout-actionBar': {
            px: 1,
            py: 1
          }
        })
    }
  },
  /** Date-picker field — the v8 picker uses MuiPickersInputBase (not MuiInputBase), so mirror the adornment reset so the calendar/clock icon area stays transparent. */
  MuiPickersInputBase: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          '& .MuiInputAdornment-root': {
            bgcolor: 'transparent'
          }
        })
    }
  },
  /** Date and time picker field — the v8 field renders its own input, sections and outline
   *  classes, so it takes the text field look plus those classes sized as MuiInputBase sizes
   *  an input (16px sides, 12px over a 24px line: the same 48px height). */
  MuiPickersTextField: {
    styleOverrides: {
      root: (props: ThemeProps) => ({
        ...textFieldRoot(props),
        ...props.theme.sx({
          '& .MuiPickersOutlinedInput-notchedOutline': {
            borderRadius: 1,
            borderColor: 'divider'
          },
          '& .MuiPickersInputBase-root': { px: 2 },
          '& .MuiPickersSectionList-root': { py: 1.5, lineHeight: toRem(24) }
        })
      })
    }
  },
  /** Checkbox — primary-colored, no hover background, negative vertical margin to align with adjacent text; `edge: 'start'` cancels the native left padding so the icon sits flush with content while keeping the click target. */
  MuiCheckbox: {
    defaultProps: {
      edge: 'start' as const
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          my: -1,
          color: 'primary.main',
          '&:hover': { bgcolor: 'transparent' }
        })
    }
  },
  /** Alert — rounded surface with tuned icon/message/action spacing and 16px message text. */
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.sx({
          borderRadius: 2
        }),

      icon: ({ theme }: ThemeProps) =>
        theme.sx({
          py: 0.75
        }),
      message: ({ theme }: ThemeProps) =>
        theme.sx({
          fontSize: toRem(16),
          lineHeight: toRem(24)
        }),
      action: ({ theme }: ThemeProps) =>
        theme.sx({
          pl: 1,
          pr: 0.5
        })
    }
  }
}

export default components
