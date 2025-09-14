import { useEffect, useState } from 'react'

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import HolidayVillageOutlinedIcon from '@mui/icons-material/HolidayVillageOutlined'
import { Box, Button, Stack } from '@mui/material'

import useIntersectionObserver from 'hooks/useIntersectionObserver'

import { maxContainerWidth, maxHistoryHeight } from '../constants'
import { type ChatItem } from '../types'
import { hasFilters } from '../utils'

import { ChatBubble, TypingText } from '.'

const ChatHistoryList = ({
  history,
  open = false,
  onResetFilters,
  onApplyFilters
}: {
  history: ChatItem[]
  open?: boolean
  onResetFilters?: () => void
  onApplyFilters?: (item: ChatItem) => void
}) => {
  const [visible, containerRef] = useIntersectionObserver(0)
  const [showButton, setShowButton] = useState<'apply' | 'reset' | false>(false)

  const scrollToBottom = (behavior: 'smooth' | 'instant') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 1000000,
        behavior
      })
    }
  }

  const checkFiltersAvailability = () => {
    if (history.length > 1 && hasFilters(history.at(-1)!)) {
      setShowButton('apply')
    }
  }

  const handleTyping = () => {
    scrollToBottom('smooth')
  }

  const handleTypingEnd = () => {
    checkFiltersAvailability()
    setTimeout(() => scrollToBottom('smooth'), 0)
  }

  const handleApplyFilters = () => {
    setShowButton('reset')
    onApplyFilters?.(history.at(-1)!)
  }

  const handleResetFilters = () => {
    setShowButton('apply')
    onResetFilters?.()
  }

  useEffect(() => {
    setShowButton(false)
    // skip one frame to allow the chat history to be rendered
    setTimeout(() => scrollToBottom('smooth'), 100)
  }, [history.length])

  useEffect(() => {
    if (!open) return

    checkFiltersAvailability()
    setTimeout(() => scrollToBottom('instant'), 0)
  }, [open])

  return (
    <Box
      ref={containerRef}
      sx={{
        overflowX: 'none',
        overflowY: 'auto',
        position: 'relative',
        opacity: open ? 1 : 0,
        scrollbarWidth: 'none',
        bgcolor: 'background.paper',
        transition: 'opacity 0.2s linear',
        width: maxContainerWidth,
        maxHeight: !history.length ? 0 : maxHistoryHeight
      }}
    >
      <Stack
        spacing={1}
        sx={{
          '&:first-child': { pt: 1 },
          '&:last-child': { pb: 1.2 }
        }}
      >
        {history.map(({ value, type }, index) => (
          <ChatBubble type={type} key={index}>
            {type === 'ai' ? (
              <TypingText
                text={value}
                animate={visible}
                onTyping={handleTyping}
                onTypingEnd={handleTypingEnd}
              />
            ) : (
              value
            )}
          </ChatBubble>
        ))}

        {showButton && (
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            justifyContent="center"
            px={2}
          >
            {showButton === 'apply' && (
              <Button
                size="small"
                color="secondary"
                variant="contained"
                startIcon={<HolidayVillageOutlinedIcon />}
                onClick={handleApplyFilters}
                sx={{ width: 140 }}
              >
                Apply Filters
              </Button>
            )}

            {showButton === 'reset' && (
              <Button
                size="small"
                color="secondary"
                variant="contained"
                startIcon={<DeleteOutlineOutlinedIcon />}
                onClick={handleResetFilters}
                sx={{ width: 140 }}
              >
                Reset Filters
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

export default ChatHistoryList
