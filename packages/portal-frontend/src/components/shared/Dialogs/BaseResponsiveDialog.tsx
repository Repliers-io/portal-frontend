import React from 'react'

import { Dialog } from '@mui/material'

import { type DialogName, useDialog } from 'providers/DialogProvider'
import useBreakpoints from 'hooks/useBreakpoints'

import {
  DialogCloseButton,
  emptyTransition,
  slideUpTransition,
  zoomInTransition
} from './components'

export const BaseResponsiveDialog = ({
  name = 'unknown',
  maxWidth = 640,
  maxHeight,
  height,
  transition = 'zoom',
  closeButton = true,
  keepMounted = false,
  disableRestoreFocus = false,
  centered = false,
  centeredContent = false,
  flushContent = false,
  labelledBy,
  onClose,
  children
}: {
  name?: DialogName
  maxWidth?: string | number | { [key: string]: string | number }
  /** Caps the desktop paper; the content scrolls inside it. */
  maxHeight?: string | number
  /** Fixes the desktop paper's height, so changing content never resizes it. */
  height?: string | number
  /** Desktop entrance; mobile always slides up. */
  transition?: 'zoom' | 'slide'
  /** Drop it when the content renders a close button of its own. */
  closeButton?: boolean
  /** Keep the content mounted while closed, so it carries state between openings. */
  keepMounted?: boolean
  /** Leave the focus where it is on close instead of handing it back to the trigger. */
  disableRestoreFocus?: boolean
  /** Center the whole stack (title, content, actions) in mobile fullscreen mode. */
  centered?: boolean
  /** Keep title and actions at the screen edges, center only the content between them. */
  centeredContent?: boolean
  /** Drop the vertical padding of the content and its wrapper in mobile fullscreen mode. */
  flushContent?: boolean
  /** Id of the visible title that names this dialog for assistive tech. */
  labelledBy?: string
  onClose?: () => void
  children: React.ReactNode
}) => {
  const { mobile } = useBreakpoints()
  const { visible, animate, hideDialog } = useDialog(name)

  const handleClose = () => {
    hideDialog()
    onClose?.()
  }
  const TransitionComponent =
    mobile || transition === 'slide' ? slideUpTransition : zoomInTransition

  return (
    <Dialog
      open={visible}
      onClose={handleClose}
      fullScreen={mobile}
      keepMounted={keepMounted}
      disableRestoreFocus={disableRestoreFocus}
      aria-labelledby={labelledBy}
      sx={{
        zIndex: 'modal',
        // the dialog's own paper only: `.MuiPaper-root` below also reaches every nested
        // Paper (accordions, cards)
        '.MuiDialog-paper': { ...(!mobile && height && { height }) },
        '.MuiPaper-root': {
          width: '100%',
          maxWidth,
          ...(!mobile && maxHeight && { maxHeight }),
          // flex '0 1 auto': the content stops growing so the stack can
          // center, but still shrinks so its overflow scroll survives.
          ...(centered &&
            mobile && {
              justifyContent: 'center',
              '.MuiDialogContent-root': { flex: '0 1 auto' }
            }),
          ...(centeredContent &&
            mobile && {
              '.MuiDialogContent-root': {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }
            }),
          ...(flushContent &&
            mobile && {
              '.MuiDialogContent-root, .MuiDialogContent-root > *': { py: 0 }
            })
        }
      }}
      TransitionComponent={animate ? TransitionComponent : emptyTransition}
    >
      {closeButton && <DialogCloseButton onClose={handleClose} />}
      {children}
    </Dialog>
  )
}
