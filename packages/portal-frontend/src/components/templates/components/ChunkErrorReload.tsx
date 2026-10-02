import React from 'react'

/**
 * Recovers a document that outlived its own JavaScript.
 *
 * Chunk filenames are content-hashed per build and the previous build's files
 * are gone the moment a new slug boots, so HTML from an earlier deploy — an
 * open tab, or a copy the browser replayed from its disk cache — asks for
 * `/_next/static/*` files that 404, and the page dies with no visible error.
 * Next has no recovery for this when self-hosted: `deploymentId` only stamps
 * `?dpl=` onto asset URLs, and the skew-protection reload is Vercel-only.
 *
 * A raw inline `<script>` rather than `next/script`: the default
 * `afterInteractive` strategy runs after hydration, far too late for a page
 * whose bundles are the thing failing, and `beforeInteractive` was measured to
 * emit at exactly this position anyway. Next writes its own bundle tags ahead
 * of any layout head content, so this cannot precede them in the document — it
 * does not need to, because those are `async` and so do not block parsing:
 * this executes within the same parse, while a failed fetch costs at least a
 * network round trip. Resource load errors do not bubble, hence the
 * capture-phase listener.
 */
const script = `
(function () {
  var key = 'chunkReloadCount'
  // A chunk missing from the *current* build is a build fault, not a stale
  // document — reloading past this cap would spin forever without fixing it.
  var maxReloads = 2
  // Surviving this long counts as a successful recovery, so a tab left open
  // across several deploys can heal more than twice.
  var settleMs = 30000

  function recover() {
    try {
      var count = Number(sessionStorage.getItem(key)) || 0
      if (count >= maxReloads) return
      sessionStorage.setItem(key, String(count + 1))
    } catch (err) {
      // Private mode or blocked site data: without a counter there is nothing
      // to stop a reload loop, so do nothing at all.
      return
    }
    location.reload()
  }

  addEventListener('error', function (event) {
    var target = event.target
    var url = target && (target.src || target.href)
    if (typeof url === 'string' && url.indexOf('/_next/static/') > -1) recover()
  }, true)

  addEventListener('unhandledrejection', function (event) {
    var reason = event.reason
    if (!reason) return
    if (reason.name === 'ChunkLoadError' || /Loading (CSS )?chunk/.test(reason.message || '')) recover()
  })

  setTimeout(function () {
    try { sessionStorage.removeItem(key) } catch (err) {}
  }, settleMs)
})()
`

export const ChunkErrorReload = () => (
  <script dangerouslySetInnerHTML={{ __html: script }} />
)
