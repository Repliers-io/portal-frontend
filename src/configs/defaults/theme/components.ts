import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { alpha, type Theme } from '@mui/material'

import { primary } from '@configs/colors'

import { toRem } from 'utils/theme'

export type ThemeProps = {
  theme: Theme
}

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      lineHeight: 1.75
    }
  },
  MuiTypography: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          color: 'text.primary'
        }),
      gutterBottom: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          pb: 2
        })
    }
  },
  MuiLink: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          color: 'inherit',
          textDecorationColor: 'inherit'
        })
    }
  },
  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          bgcolor: 'common.white',
          color: 'common.black',
          position: 'relative',
          borderRadius: 0,
          boxShadow: '0 0 35px #A1A1A126'
        })
    }
  },
  MuiStack: {
    defaultProps: {
      useFlexGap: true
    }
  },
  MuiMenu: {
    defaultProps: {
      disableScrollLock: true
    }
  },
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          fontSize: toRem(16)
        })
    }
  },
  MuiButtonGroup: {
    defaultProps: {
      disableElevation: true
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
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
        theme.unstable_sx({
          color: 'common.white',
          bgcolor: 'primary.main'
        })
    }
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
      disableFocusRipple: true
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
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
        theme.unstable_sx({
          px: 3,
          py: 2,
          height: 'auto',
          fontSize: toRem(18),
          lineHeight: toRem(20)
        }),
      sizeSmall: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          px: 2,
          py: 1,
          height: 38,
          fontSize: toRem(14),
          lineHeight: toRem(20)
        })
    }
  },
  MuiToggleButtonGroup: {
    defaultProps: {
      // disableElevation: true
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          border: 0,
          borderRadius: 1,
          maxHeight: 48,
          color: 'text.primary',
          bgcolor: 'divider',

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
                borderColor: 'divider'
              }
            }
        }),
      contained: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          color: 'common.white',
          bgcolor: 'primary.main'
        })
    }
  },
  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          p: 2,
          maxHeight: 48,
          border: 0,
          borderRadius: 1,
          color: 'common.black',

          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'common.white',

            '& svg path': { fill: 'currentColor' },
            '&::after': { display: 'none' },
            '&:hover': { bgcolor: 'primary.dark' }
          }
        }),
      sizeLarge: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          px: 3,
          py: 2,
          height: 'auto',
          fontSize: toRem(16),
          lineHeight: toRem(20)
        }),
      sizeSmall: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          px: 2,
          py: 1,
          border: 0,
          height: 'auto',
          fontSize: toRem(14),
          lineHeight: toRem(20)
        })
    }
  },
  MuiSelect: {
    defaultProps: {
      IconComponent: ExpandMoreIcon
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
        theme.unstable_sx({
          minHeight: 0,
          py: 2
        }),
      multiple: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
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
        theme.unstable_sx({
          fontSize: 22,
          color: 'primary.main'
        })
    }
  },
  MuiInputAdornment: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          px: 0,
          color: 'text.hint',
          bgcolor: 'background.default'
        })
    }
  },
  MuiInput: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          fontSize: toRem(16),
          lineHeight: toRem(24)
        })
    }
  },
  MuiAutocomplete: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
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
        theme.unstable_sx({
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
  MuiFilledInput: {
    defaultProps: {
      disableUnderline: true
    },
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          p: 0,
          borderRadius: 1,
          bgcolor: 'background.default'
        })
    }
  },
  MuiSkeleton: {
    defaultProps: {
      animation: 'wave' as const // weird type fixes because MUI misses type declarations
    },
    styleOverrides: {
      rounded: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          borderRadius: 1,
          bgcolor: 'background.default'
        })
    }
  },
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          overflow: 'hidden',
          borderRadius: 2
        })
    }
  },
  MuiDivider: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          borderColor: 'divider',
          my: 0.5
        })
    }
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          p: 1,
          textAlign: 'center',
          fontSize: toRem(14)
        })
    }
  },
  MuiTabs: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          '& .MuiButtonBase-root:first-child': {
            ml: 0
          }
        })
    }
  },
  MuiTab: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          p: 2,
          lineHeight: toRem(32)
        })
    }
  },
  MuiInputBase: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
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
        theme.unstable_sx({
          fontSize: toRem(16)
        })
    }
  },

  MuiTextField: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
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
          [[
            '& .MuiInputLabel-root.Mui-focused',
            '& .MuiInputLabel-shrink'
          ].join(',')]: {
            transform: 'translate(9px,-8px) scale(0.75)'
          },
          '& .MuiInputBase-root .MuiInputBase-input.MuiSelect-select': {
            py: 1.5
          }
        })
    }
  },
  MuiDialog: {
    defaultProps: {
      disableScrollLock: true,
      // keepMounted: true,
      elevation: 3,
      TransitionComponent: undefined,
      scroll: 'paper' as const // weird type fixes because MUI misses type declarations
    }
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 8, sm: 12 },
          textAlign: 'center',
          fontSize: toRem(24),
          lineHeight: toRem(32)
        })
    }
  },
  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          py: 2,
          px: { xs: 2, sm: 4, md: 8 },
          scrollbarWidth: 'thin'
        })
    }
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          justifyContent: 'center',
          bgcolor: { xs: 'background.default', sm: 'background.paper' },
          pt: { xs: 2, sm: 2 },
          pb: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 8 }
        })
    }
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          '& .MuiDialogTitle-root': {
            py: 2
          },

          '& .MuiDialogContent-root': {
            py: 0,
            px: { xs: 2, sm: 4 }
          },

          '& .MuiDialogActions-root': {
            py: 2,
            px: { xs: 2, sm: 4 },
            bgcolor: 'background.default'
          }
        })
    }
  },
  MuiPopover: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          '& .MuiPaper-root': {
            boxShadow: 1,
            borderRadius: 1
          }
        })
    }
  },
  MuiPopper: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          '& .MuiPaper-root': {
            boxShadow: 1,
            borderRadius: 1
          }
        })
    }
  },
  MuiPickersPopper: {
    styleOverrides: {
      paper: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          '& .MuiDayCalendar-weekDayLabel': {
            fontSize: toRem(12)
          },
          '& .MuiPickersDay-root': {
            fontSize: toRem(14)
          },
          '& .MuiPickersLayout-actionBar': {
            px: 0,
            py: 1
          }
        })
    }
  },
  MuiCheckbox: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          color: 'primary.main'
        })
    }
  },
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          borderRadius: 2,

          '&.MuiAlert-colorSuccess': {
            color: 'common.white'
          }
        }),

      icon: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          py: 0.75
        }),
      message: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          fontSize: toRem(16),
          lineHeight: toRem(24)
        }),
      action: ({ theme }: ThemeProps) =>
        theme.unstable_sx({
          pl: 1,
          pr: 0.5
        })
    }
  }
}

export default components
