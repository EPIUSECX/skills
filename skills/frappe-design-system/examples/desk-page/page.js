/* Mode A. A Desk page fills the page body. It does not render a dock, sidebar, or page head.
 * Desk already drew those. Register the page the usual way (a Page document) and load this file
 * from the page's JS. This file is a reference, not a fixture installed on a site.
 */
frappe.pages.workforce_overview = frappe.pages.workforce_overview || {}
frappe.pages.workforce_overview.on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: 'Overview',
    single_column: true,
  })
  page.set_primary_action('New', () => {
    frappe.new_doc('Employee')
  })
  // Number cards use the Desk number-card padding. Do not add a second header.
  $(page.body).html(`
    <div class="workforce-metrics"></div>
  `)
}
