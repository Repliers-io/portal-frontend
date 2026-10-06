import { type ReactNode } from 'react'

import './widgets.css'

/**
 * Minimal layout for embedded widgets
 * No header, footer, or navigation - just the widget content
 * Transparent background for seamless iframe embedding
 */
export default function WidgetsLayout({ children }: { children: ReactNode }) {
  return children
}
