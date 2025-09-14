'use client'

import React, { useState } from 'react'

import MapsHomeWorkOutlinedIcon from '@mui/icons-material/MapsHomeWorkOutlined'
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  Typography
} from '@mui/material'

import routes from '@configs/routes'
import { PageTemplate } from '@templates'

import useResponsiveValue from 'hooks/useResponsiveValue'

export const dynamic = 'force-dynamic'

const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

const TestPage = () => {
  const popupWidth = useResponsiveValue({ xs: 375, sm: 640 }) || 640
  const popupHeight = useResponsiveValue({ xs: 326, sm: 234 }) || 234

  const [addLogo, setAddLogo] = useState(false)

  const iframeUrl =
    `${domain}${routes.estimate}/embedded` + (addLogo ? '?logo=true' : '')

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const left = window.screen.width / 2 - popupWidth / 2
    const top = window.screen.height / 2 - popupHeight / 2
    window.open(
      iframeUrl,
      '_blank',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,addressbar=no,location=no,status=no`
    )
  }

  return (
    <PageTemplate bgcolor="background.default">
      <Container maxWidth="lg">
        <Stack
          direction="row"
          spacing={4}
          py={{ xs: 2, sm: 4, md: 6 }}
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{ position: 'relative' }}
        >
          <Box
            sx={{
              px: 2,
              top: 32,
              width: 180,
              position: 'sticky',
              '& a:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            <Typography variant="h4" pb={1}>
              Page Contents
            </Typography>
            <ul style={{ padding: '0 16px', margin: 0 }}>
              <li>
                <a href="#e1">Example 1</a>
              </li>
              <li>
                <a href="#e2">Example 2</a>
              </li>
              <li>
                <a href="#e3">Example 3</a>
              </li>
            </ul>
          </Box>
          <Stack
            sx={{ width: '750px' }}
            mt={-3}
            spacing={{ xs: 2, sm: 4, md: 8 }}
            alignItems="center"
            justifyContent="center"
          >
            <Stack spacing={3} width="100%">
              <a id="e1">
                <Typography variant="h2" pt={4} my={-2}>
                  Example 1
                </Typography>
              </a>
              <Typography variant="h3">
                Button to open new window with estimate form
              </Typography>
              <Box
                sx={{
                  p: 1,
                  border: 1,
                  borderColor: '#000',
                  bgcolor: '#234',
                  color: '#FFF',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  borderRadius: 1
                }}
              >
                {`
<button onClick="window.open('${iframeUrl}', '_blank', 'width=640,height=234,left='+(window.screen.width/2-640/2)+',top='+(window.screen.height/2-234/2)+',resizable=yes,scrollbars=no,toolbar=no,addressbar=no,location=no,status=no')">Open Estimate Form</button>`}
              </Box>
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Button
                  size="large"
                  color="primary"
                  variant="contained"
                  startIcon={<MapsHomeWorkOutlinedIcon sx={{ mr: 1 }} />}
                  onClick={handleButtonClick}
                  sx={{ mx: 'auto' }}
                >
                  Open Estimate Form
                </Button>
              </Box>
            </Stack>

            <Stack spacing={3} alignItems="flex-start">
              <a id="e2">
                <Typography variant="h2" pt={4} my={-2}>
                  Example 2
                </Typography>
              </a>
              <Typography variant="h3">
                &lt;iframe&gt; width can be any reasonable size for modern
                devices, from mobile to desktop browsers. The minimal
                recommended height is 234px (<i>desktop</i>) / 326px (
                <i>mobile</i>)
              </Typography>
              <Box
                sx={{
                  p: 1,
                  border: 1,
                  borderColor: '#000',
                  bgcolor: '#234',
                  color: '#FFF',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  borderRadius: 1
                }}
              >
                {`
<iframe
  src="${iframeUrl}"
  frameBorder="0"
  scrolling="no"
  width="750"
  height="234"></iframe>`}
              </Box>
              <Box>
                <Typography variant="h4" mb={1}>
                  750x234
                </Typography>
                <iframe
                  src={iframeUrl}
                  frameBorder={0}
                  scrolling="no"
                  style={{
                    width: 750,
                    height: 234,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                />
              </Box>
              <Box>
                <Typography variant="h4" mb={1}>
                  640x234
                </Typography>

                <iframe
                  src={iframeUrl}
                  frameBorder={0}
                  scrolling="no"
                  style={{
                    width: 640,
                    height: 234,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                />
              </Box>

              <Box>
                <Typography variant="h4" mb={1}>
                  375x326
                </Typography>
                <iframe
                  src={iframeUrl}
                  frameBorder={0}
                  scrolling="no"
                  style={{
                    width: 375,
                    height: 326,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                />
              </Box>
            </Stack>
            <Stack spacing={3} alignItems="flex-start">
              <a id="e3">
                <Typography variant="h2" pt={4} my={-2}>
                  Example 3
                </Typography>
              </a>
              <Typography variant="h3">
                &lt;iframe&gt; with more than 450px (<i>desktop</i>) / 542px (
                <i>mobile</i>) height will be able to show map for address
                confirmation
              </Typography>
              <Box
                sx={{
                  p: 1,
                  border: 1,
                  borderColor: '#000',
                  bgcolor: '#234',
                  color: '#FFF',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  borderRadius: 1
                }}
              >
                {`
<iframe
  src="${iframeUrl}"
  frameBorder="0"
  scrolling="no"
  width="750"
  height="450"></iframe>`}
              </Box>
              <Box>
                <Typography variant="h4" mb={1}>
                  750x450
                </Typography>

                <iframe
                  src={iframeUrl}
                  frameBorder={0}
                  scrolling="no"
                  style={{
                    width: 750,
                    height: 450,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                />
              </Box>

              <Box>
                <Typography variant="h4" mb={1}>
                  640x450
                </Typography>

                <iframe
                  src={iframeUrl}
                  frameBorder={0}
                  scrolling="no"
                  style={{
                    width: 640,
                    height: 450,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                />
              </Box>

              <Box>
                <Typography variant="h4" mb={1}>
                  375x542
                </Typography>
                <iframe
                  src={iframeUrl}
                  frameBorder={0}
                  scrolling="no"
                  style={{
                    width: 375,
                    height: 542,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                />
              </Box>
            </Stack>
          </Stack>
          <Box
            sx={{
              p: 2,
              pb: 0.5,
              top: 32,
              width: 180,
              position: 'sticky',
              bgcolor: 'background.paper',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" pb={1}>
              Iframe Parameters
            </Typography>
            <FormControlLabel
              label="Show Logo"
              control={
                <Checkbox
                  checked={addLogo}
                  onChange={(e) => setAddLogo(e.target.checked)}
                />
              }
            />
          </Box>
        </Stack>
      </Container>
    </PageTemplate>
  )
}

export default TestPage
