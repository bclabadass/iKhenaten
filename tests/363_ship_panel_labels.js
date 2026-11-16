// The warship and transport orders panels show their labels (Brendan on the Duo: garbled text on the transport's
// orders screen). "Hull strength" and "Crew fatigue" were written as ${184.2} and ${184.27}, which the text
// formatter looks up in the game's own text files; group 184 is the port's English text, so the label read
// "??184.2?". The panels set them from script now, as they do the values beside them.
// Markers:
//   [test-marker] transport_panel_labels
//   [test-marker] warship_panel_labels

function t363_open(fid, section) {
    __test_open_ship_orders(fid)
    __test_pump_frames(4)
    return __test_info_window_section() == section
}

function run_test() {
    test_reload_city_session('data/default.map')
    var cx = (__scenario_map.width / 2) | 0, cy = (__scenario_map.height / 2) | 0
    for (var wy = cy + 1; wy <= cy + 9; wy++) {
        for (var wx = cx - 8; wx <= cx + 8; wx++) {
            terrain.set_water({ x: wx, y: wy })
        }
    }
    __test_map_routing_update_water()
    var transport = test_figure_create(FIGURE_TRANSPORT_SHIP, cx - 2, cy + 5)
    var warship = test_figure_create(FIGURE_WARSHIP, cx + 2, cy + 5)
    game.paused = true

    var opened = t363_open(transport, 'figure_transport_ship_info_window')
    var hull = __test_info_ui_text('hullstrength_lb')
    __log_info_native('[test:363] transport panel ' + opened + ': hull label ' + JSON.stringify(hull))
    if (opened && hull == __loc(184, 2) && hull.indexOf('?') < 0) {
        __log_marker('transport_panel_labels')
    }
    ui.window_city_show()
    __test_pump_frames(2)

    opened = t363_open(warship, 'figure_warship_info_window')
    hull = __test_info_ui_text('hullstrength_lb')
    var fatigue = __test_info_ui_text('crewfatique_lb')
    __log_info_native('[test:363] warship panel ' + opened + ': hull label ' + JSON.stringify(hull) + ', crew label '
        + JSON.stringify(fatigue))
    if (opened && hull == __loc(184, 2) && fatigue == __loc(184, 27)) {
        __log_marker('warship_panel_labels')
    }
    ui.window_city_show()
    __test_pump_frames(2)
    game.paused = false
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] transport_panel_labels')
        && __test_find_inlog('[test-marker] warship_panel_labels')
}
