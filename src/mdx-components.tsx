import React from 'react'

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import {
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material'

import type { MDXComponents } from 'mdx/types'

// You can customize global MDX components here: h1, h2, h3, p, a, etc.
// https://nextjs.org/docs/pages/building-your-application/configuring/mdx#global-styles-and-components
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: (props) => (
      <Link target="_blank" rel="noreferrer" {...(props as any)}>
        {props.children}
      </Link>
    ),
    strong: (props) => (
      <Typography component="strong" fontWeight="900">
        {props.children}
      </Typography>
    ),
    h1: (props) => <Typography variant="h1">{props.children}</Typography>,
    h2: (props) => <Typography variant="h2">{props.children}</Typography>,
    h3: (props) => <Typography variant="h3">{props.children}</Typography>,
    p: (props) => <Typography gutterBottom>{props.children}</Typography>,
    ul: (props) => <List>{props.children}</List>,
    li: (props) => (
      <ListItem>
        <ListItemIcon>
          <FiberManualRecordIcon fontSize="inherit" />
        </ListItemIcon>
        <ListItemText primary={props.children} />
      </ListItem>
    ),
    ...components
  }
}
