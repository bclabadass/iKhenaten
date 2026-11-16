// The Overseer of the Military has a navy report. Pharaoh's overseer "issues both an army report and a navy report
// ... Click the button in the lower right corner to view the navy status report", with each ship's crew fatigue and
// hull strength, Go to Warship and Return to Wharf (Overseer of the Military help; texts 51.19-25). The port showed
// only the army (Brendan on the Duo). A button in the lower right now switches to the navy and back.
// Markers:
//   [test-marker] navy_report_lists_ships
//   [test-marker] navy_report_back_to_army

function t352_tap(p) {
    __test_touch_down(1, p.x, p.y)
    __test_pump_frames(2)
    __test_touch_up(1, p.x, p.y)
    __test_pump_frames(6)
}

function t352_tap_toggle() {
    var pos = __test_window_element_screen_pos('advisor_military_window', 'navy_toggle')
    var size = __test_window_element_size('advisor_military_window', 'navy_toggle')
    t352_tap({ x: pos.x + ((size.x / 2) | 0), y: pos.y + ((size.y / 2) | 0) })
}

function run_test() {
    test_reload_city_session('data/default.map')
    test_figure_create(FIGURE_WARSHIP, 40, 40)
    test_figure_create(FIGURE_TRANSPORT_SHIP, 42, 40)
    city.set_advisor_available(ADVISOR_MILITARY, 1)
    window_advisors_show_advisor(ADVISOR_MILITARY)
    __test_pump_frames(4)
    var army_title = __test_window_element_text('advisor_military_window', 'title')
    var button = __test_window_element_text('advisor_military_window', 'navy_toggle')

    t352_tap_toggle()
    var navy_title = __test_window_element_text('advisor_military_window', 'title')
    var ships = advisor_military_ships.length
    __log_info_native('[test:352] army title ' + JSON.stringify(army_title) + ', button ' + JSON.stringify(button)
        + '; after the tap: title ' + JSON.stringify(navy_title) + ', ships listed ' + ships)
    if (army_title == __loc(51, 0) && button == __loc(51, 19) && navy_title == __loc(51, 19) && ships == 2) {
        __log_marker('navy_report_lists_ships')
    }

    t352_tap_toggle()
    var back = __test_window_element_text('advisor_military_window', 'title')
    __log_info_native('[test:352] tapped again: title ' + JSON.stringify(back))
    if (back == __loc(51, 0)) {
        __log_marker('navy_report_back_to_army')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] navy_report_lists_ships')
        && __test_find_inlog('[test-marker] navy_report_back_to_army')
}
