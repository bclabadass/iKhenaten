// To-do 2d: Selima's yearly timber demand increase (m_008_selima.js) showed "Increased Trading" with "200 Timber Month 0
// to comply" under it. Trade and price changes post on the general template, which opens in the window built for
// requests; a request's good, amount and months were added whenever the event named a good. Only requests show them
// now (test 366 checks a request keeps its line).
// Markers:
//   [test-marker] t922_demand_change_no_request_line
//   [test-marker] t922_price_change_no_request_line

function t922_run(spec) {
    ui.window_city_show()
    __test_pump_frames(2)
    city.create_chain_event(spec).execute()
    __test_process_events()
    __test_pump_frames(6)
    var section = __test_message_dialog_section()
    return { section: section, text: '' + __test_window_element_text(section, 'content_text') }
}

function run_test() {
    test_reload_city_session('data/default.map')
    var comply = __loc(12, 2)
    var demand = t922_run({ tag_id: 922, type: EVENT_TYPE_DEMAND_INCREASE, resource: RESOURCE_TIMBER, amount: 2,
        trigger: EVENT_TRIGGER_ONCE })
    __log_info_native('[test:922] demand change (' + demand.section + '): ' + JSON.stringify(demand.text))
    if (demand.text.length > 0 && demand.text.indexOf(comply) < 0) {
        __log_marker('t922_demand_change_no_request_line')
    }
    var price = t922_run({ tag_id: 923, type: EVENT_TYPE_PRICE_INCREASE, resource: RESOURCE_TIMBER, amount: 10,
        trigger: EVENT_TRIGGER_ONCE })
    __log_info_native('[test:922] price change (' + price.section + '): ' + JSON.stringify(price.text))
    if (price.text.length > 0 && price.text.indexOf(comply) < 0) {
        __log_marker('t922_price_change_no_request_line')
    }
    ui.window_city_show()
    __test_pump_frames(2)
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t922_demand_change_no_request_line')
        && __test_find_inlog('[test-marker] t922_price_change_no_request_line')
}
