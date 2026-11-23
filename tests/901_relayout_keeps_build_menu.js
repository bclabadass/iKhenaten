// A screen size change (folding or turning the iPhone Duo) re-runs the ui_* scripts in name order. ui_build_menu.js
// adds ui.window_build_menu_show to the ui object, and ui_common.js, which sorts after it, built a new ui object
// without it: after the relayout the sidebar's build buttons threw "called object is not a function".
// Markers:
//   [test-marker] t901_relayout_ran
//   [test-marker] t901_build_menu_show_kept
//   [test-marker] t901_road_button_works

function run_test() {
    test_reload_city_session('data/default.map')
    var w = screen.width
    var h = screen.height
    __test_screen_resize(w + 64, h + 48)
    __test_pump_frames(2)
    // Past the relayout settle delay (300 ms), then the frame that runs it.
    __test_sleep_ms(600)
    __test_pump_frames(3)
    if (__test_find_inlog('refresh=windows')) {
        __log_marker('t901_relayout_ran')
    }
    __log_info_native('[test:901] after relayout window_build_menu_show is ' + typeof ui.window_build_menu_show)
    if (typeof ui.window_build_menu_show === 'function') {
        __log_marker('t901_build_menu_show_kept')
    }
    try {
        window_build_menu_build_road()
        __test_pump_frames(2)
        __log_info_native('[test:901] road button: window ' + __game_window_get_id() + ' build type ' + city_planner.build_type)
        if (ui.window_is('build_menu_widget') || city_planner.build_type == BUILDING_ROAD) {
            __log_marker('t901_road_button_works')
        }
    } catch (e) {
        __log_info_native('[test:901] road button threw: ' + e)
    }
    ui.window_city_show()
    __test_screen_resize(w, h)
    __test_pump_frames(2)
    __test_sleep_ms(600)
    __test_pump_frames(3)
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t901_relayout_ran')
        && __test_find_inlog('[test-marker] t901_build_menu_show_kept')
        && __test_find_inlog('[test-marker] t901_road_button_works')
}
