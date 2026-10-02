'use client'

import React, { useState } from 'react'

import { Box, Link, Stack, Typography } from '@mui/material'

import { ChevronRightIcon, ExpandMoreIcon } from '@configs/icons'

import { type PathNode } from 'services/CMS/utils/pathMapping'
import { capitalize } from 'utils/strings'

type PathTreeProps = {
  tree: PathNode
  title?: string
}

// Recursive tree node component
const PathTreeNode = ({
  name,
  node,
  level = 0,
  parentPath = ''
}: {
  name: string
  node: PathNode
  level?: number
  parentPath?: string
}) => {
  const hasChildren = Object.keys(node).some((key) => key !== 'meta')
  const [expanded, setExpanded] = useState(level === 0)

  // Only show nodes that have children (branches), not leaf nodes
  if (!hasChildren) return null

  // Check if there are any child branches (not just leaf nodes)
  const childBranches = Object.entries(node)
    .filter(([key]) => key !== 'meta')
    .filter(([, childNode]) => {
      const child = childNode as PathNode
      return Object.keys(child).some((key) => key !== 'meta')
    })

  const hasChildBranches = childBranches.length > 0
  const currentPath = parentPath ? `${parentPath}/${name}` : name

  // Format display name: replace dashes with spaces and capitalize
  const displayName = capitalize(name.replace(/-/g, ' '))

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: level * 3
        }}
      >
        {hasChildBranches ? (
          <Box
            onClick={() => setExpanded(!expanded)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              mr: 0.5,
              minWidth: 24
            }}
          >
            {expanded ? (
              <ExpandMoreIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </Box>
        ) : (
          <Box sx={{ minWidth: 24 }} />
        )}

        <Link
          href={`/pages/${currentPath}`}
          underline="none"
          color="text.secondary"
          sx={{
            py: 0.75,
            px: 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            borderRadius: 4,
            fontWeight: 500,
            '&:hover': {
              bgcolor: 'background.paper'
            }
          }}
        >
          <Typography variant="body2">{displayName}</Typography>
        </Link>
      </Box>

      {hasChildBranches && expanded && (
        <Stack spacing={0}>
          {childBranches.map(([key, childNode]) => (
            <PathTreeNode
              key={key}
              name={key}
              node={childNode as PathNode}
              level={level + 1}
              parentPath={currentPath}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}

export const PathTree = ({ tree, title = 'Browse by Path' }: PathTreeProps) => {
  const hasContent = Object.keys(tree).length > 0

  if (!hasContent) return null

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{title}</Typography>

      <Box>
        {Object.entries(tree)
          .filter(([key]) => key !== 'meta')
          .map(([key, node]) => (
            <PathTreeNode
              key={key}
              name={key}
              node={node as PathNode}
              level={0}
            />
          ))}
      </Box>
    </Stack>
  )
}
