'use client'

import React, { useCallback, useImperativeHandle, useRef } from 'react'

import { Box, IconButton, Select, type SelectProps } from '@mui/material'

import { SelectClearIcon } from '@configs/icons'

type PatchedSelectProps = SelectProps<unknown> & {
  // Swaps the chevron for a cross that resets the value in place.
  onClear?: () => void
}

const PatchedSelect = React.forwardRef<HTMLDivElement, PatchedSelectProps>(
  (props, parentRef) => {
    const ref = useRef<HTMLDivElement>(null)
    const { onClose, onOpen, onClear, ...otherProps } = props
    const clear = useRef(onClear)
    clear.current = onClear

    useImperativeHandle(parentRef, () => ref.current!)

    const blurOnClose = (e: React.SyntheticEvent<Element, Event>) => {
      onClose?.(e)
      const node = ref.current
      if (!node) return
      node.classList.remove('Mui-focused')
      // On close MUI's FocusTrap restores focus to the trigger (in a passive-effect
      // cleanup, so it runs after this handler and after paint). Left focused, the
      // trigger stays document.activeElement and the browser re-focuses it when the
      // tab regains focus — re-applying the active border (UR-305). Blur it once the
      // restored focus lands so MUI's own focus tracking clears the state at source.
      const blurRestoredFocus = () => {
        const active = document.activeElement
        if (!(active instanceof HTMLElement) || !node.contains(active)) return
        // Out of the focus dispatch: MUI updates its own focused state after
        // this listener, so blurring inline lands first and leaves that state
        // stuck true — and with nothing focused afterwards no blur event ever
        // arrives to clear it, so the root keeps the Mui-focused class for good.
        requestAnimationFrame(() => active.blur())
      }
      node.addEventListener('focusin', blurRestoredFocus, { once: true })
    }

    const focusOnOpen = (e: React.SyntheticEvent<Element, Event>) => {
      onOpen?.(e)
      if (ref.current) {
        ref.current.classList.add('Mui-focused')
      }
    }

    // MUI hands IconComponent nothing but a className, so the reset has to come
    // from a closure — the ref keeps that closure stable across renders. The
    // span keeps the slot's own geometry: a 1em box matching its
    // `top: calc(50% - .5em)`, so the button centres exactly where the chevron
    // was, whatever offset the variant gives the slot. `&&` doubles the class to
    // outweigh the slot's pointer-events:none by specificity — a plain override
    // ties at 0-1-0 and would hang on style insertion order. The button then
    // overflows that box symmetrically, which is why it must not flex-shrink.
    // Reset runs on click alone: the open handler lives on the sibling display
    // element and never sees these events, so nothing has to be swallowed for
    // the menu's sake, and the ripple keeps mousedown to itself.
    const clearIcon = useCallback(
      ({ className }: { className?: string }) => (
        <Box
          component="span"
          className={className}
          sx={{
            '&&': { pointerEvents: 'auto' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1em',
            height: '1em'
          }}
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              clear.current?.()
            }}
            // Inheriting the slot's size and primary tint keeps the cross matched
            // to the chevron it replaces; padding alone then sets the circle's
            // diameter, at glyph + 2×padding.
            sx={{
              flexShrink: 0,
              fontSize: 'inherit',
              color: 'inherit',
              p: '3px'
            }}
          >
            <SelectClearIcon sx={{ fontSize: 'inherit' }} />
          </IconButton>
        </Box>
      ),
      []
    )

    return (
      <Select
        ref={ref}
        {...(onClear && { IconComponent: clearIcon })}
        {...otherProps}
        onOpen={focusOnOpen}
        onClose={blurOnClose}
      />
    )
  }
)

PatchedSelect.displayName = 'PatchedSelect'

export default PatchedSelect
