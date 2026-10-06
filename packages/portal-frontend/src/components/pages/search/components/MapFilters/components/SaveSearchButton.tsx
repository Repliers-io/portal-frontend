import {
  Box,
  Button,
  ClickAwayListener,
  Skeleton,
  Tooltip
} from '@mui/material'

import { BookmarkBorderIcon } from '@configs/icons'

import { useSaveSearchButton } from './useSaveSearchButton'

export const SaveSearchButton = ({ size }: { size: 'medium' | 'small' }) => {
  const {
    clientSide,
    disabled,
    saveLabel,
    tooltipTitle,
    hintOpen,
    hintTitle,
    closeHint,
    onSave,
    onMobileTap,
    highlightSearchArea,
    hideSearchAreaHighlighting
  } = useSaveSearchButton()

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: { xs: 42, sm: 158 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )
  }

  if (size === 'medium') {
    return (
      <Tooltip arrow placement="bottom" title={tooltipTitle}>
        <span>
          <Button
            size="medium"
            variant="outlined"
            disabled={disabled}
            onClick={onSave}
            startIcon={<BookmarkBorderIcon />}
            onMouseEnter={highlightSearchArea}
            onMouseLeave={hideSearchAreaHighlighting}
            sx={{ display: { xs: 'none', sm: 'flex' }, minWidth: 158 }}
          >
            {saveLabel}
          </Button>
        </span>
      </Tooltip>
    )
  }

  // Mobile: never disabled, so a tap opens the hint (login link / limit reason)
  // instead of being a dead control. disablePortal keeps the hint inside the
  // ClickAwayListener so its link logs in rather than just dismissing.
  return (
    <ClickAwayListener onClickAway={closeHint}>
      <Box component="span" sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Tooltip
          arrow
          placement="bottom"
          open={hintOpen}
          onClose={closeHint}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          slotProps={{
            popper: { disablePortal: true },
            tooltip: { sx: { maxWidth: 220 } }
          }}
          title={hintTitle}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={onMobileTap}
            sx={{ px: { xs: 1.25, sm: 1.5 }, minWidth: 32 }}
          >
            <BookmarkBorderIcon
              sx={{ fontSize: 20, mx: { xs: 0, sm: -0.5 } }}
            />
          </Button>
        </Tooltip>
      </Box>
    </ClickAwayListener>
  )
}
