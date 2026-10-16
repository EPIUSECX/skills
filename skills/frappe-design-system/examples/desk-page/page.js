/* Mode A. A Desk Page fills the page body. Desk already draws the dock, sidebar, and page head, so
 * this file draws none of them, and it styles nothing: the widgets are Desk's own
 * (frappe/public/js/frappe/widgets), the same ones /desk/dashboard-view uses.
 *
 * Register a Page document (module, page_name "workforce-overview") and put this in its .js file.
 * Number Card and Dashboard Chart names must exist on the site.
 */
frappe.pages["workforce-overview"] = frappe.pages["workforce-overview"] || {}
frappe.pages["workforce-overview"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Workforce"),
		single_column: true,
	})
	page.set_primary_action(__("New Employee"), () => frappe.new_doc("Employee"), "plus")
	page.add_inner_button(__("Leave Applications"), () => frappe.set_route("List", "Leave Application"))

	const $body = $('<div class="dashboard-graph"></div>').appendTo(page.main)

	// 3 columns, 15px apart; the next group starts 40px below (desk/desktop.scss .widget-group).
	new frappe.widget.WidgetGroup({
		container: $body,
		type: "number_card",
		columns: 3,
		options: {},
		widgets: [
			{ name: "Active Customers", number_card_name: "Active Customers" },
			{ name: "Annual Sales", number_card_name: "Annual Sales" },
			{ name: "Active Suppliers", number_card_name: "Active Suppliers" },
		],
	})
	new frappe.widget.WidgetGroup({
		container: $body,
		type: "chart",
		columns: 2,
		height: 240,
		options: {},
		widgets: [{ name: "Sales Order Trends", chart_name: "Sales Order Trends", width: "Full" }],
	})
}
