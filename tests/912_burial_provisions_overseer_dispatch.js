// Burial provisions dispatch from the Overseer of Monuments. Clicking a provision threw in the dispatch window's
// init (`resource_icon.image(...)` is a property, not a function), so nothing could be sent; and the page counted
// the scenario's provisions (loads, as Pharaoh's requests) against the yards' units: "0 / 10 Pottery, 1200 in
// Storage", and a dispatch took 10 pottery out of 1200 (Brendan, Saqqara 10, build 14142). A screen relayout while
// the window was open re-ran the script and reset the chosen provision and amount to nothing.
// Resize the screen, click the pottery row, let the relayout settle, then Dispatch: 3 loads go, the yards drop by 300.
// Markers:
//   [test-marker] t912_dispatch_window_opens
//   [test-marker] t912_dispatched_in_loads

function t912_click(window_id, element, dx, dy) {
    var w = __test_window_pos(window_id)
    var e = __test_window_element_pos(window_id, element)
    __test_mouse_click(w.x + e.x + dx, w.y + e.y + dy)
    __test_pump_frames(3)
}

function run_test() {
    test_ensure_city_session('data/default.map')
    if (!__scenario_building_allowed(BUILDING_STORAGE_YARD)) {
        __scenario_building_allow(BUILDING_STORAGE_YARD, true)
    }
    __test_set_treasury(500000)
    __test_burial_provisions_clear()
    __test_burial_provisions_set(RESOURCE_POTTERY, 3)
    var sy = test_staffed_yard_with_resource(RESOURCE_POTTERY, 1200, -1, -1)
    var before = city.get_building(sy).stored_resource(RESOURCE_POTTERY)

    __test_screen_resize(1280, 960)
    city.set_advisor_available(ADVISOR_MONUMENTS, 1)
    game.last_advisor = ADVISOR_MONUMENTS
    window_advisors_show()
    __test_pump_frames(3)
    var area = __test_window_element_pos('advisor_monuments_window', 'advisor_area')
    var list = __test_window_element_pos('advisor_monuments_window', 'burial_list')
    __test_mouse_click(area.x + list.x + 100, area.y + list.y + 20)
    __test_pump_frames(3)
    var opened = __game_window_get_id()
    if (opened == 'burial_dispatch_window') {
        __log_marker('t912_dispatch_window_opens')
        __test_pump_frames(60)
        t912_click('burial_dispatch_window', 'btn_dispatch', 80, 12)
    }
    var after = city.get_building(sy).stored_resource(RESOURCE_POTTERY)
    var sent = __scenario_burial_provisions_dispatched(RESOURCE_POTTERY)
    __log_info_native('[test:912] yard ' + sy + ', window after click ' + opened + ', dispatched ' + sent
        + ' loads, yards ' + before + ' -> ' + after)
    if (sent == 3 && before - after == 300) {
        __log_marker('t912_dispatched_in_loads')
    }
    __test_burial_provisions_clear()
    __test_screen_resize(800, 600)
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t912_dispatch_window_opens')
        && __test_find_inlog('[test-marker] t912_dispatched_in_loads')
}
