// Mobile sidebar drawer for shell.css (Desk opens .body-sidebar from .sidebar-toggle-btn below 768px).
// Markup: <button class="nav-toggle" data-nav-toggle aria-controls="sidebar" aria-expanded="false">,
// <nav class="sidebar" id="sidebar">, and <div class="nav-scrim" data-nav-toggle> inside .shell.
;(() => {
  const shell = document.querySelector('.shell')
  const toggle = document.querySelector('.nav-toggle')
  if (!shell || !toggle) return
  function set(open) {
    shell.toggleAttribute('data-nav-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    if (open) document.querySelector('#sidebar .nav-item')?.focus()
    else toggle.focus()
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-nav-toggle]')) set(!shell.hasAttribute('data-nav-open'))
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && shell.hasAttribute('data-nav-open')) set(false)
  })
})()
