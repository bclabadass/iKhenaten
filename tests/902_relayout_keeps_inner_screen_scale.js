// On the Duo's inner screen pop-ups are drawn 1.5x and lay out on a virtual screen 1.5x smaller. A screen size change
// (folding, turning) re-runs the ui_* scripts, which laid every window out on the full canvas: the scaled pop-ups came
// out off-centre and partly off screen (Brendan, build 14113). After the re-run, scaled windows must lay out again on
// their virtual screen.
// Markers:
//   [test-marker] t902_relayout_ran
//   [test-marker] t902_centred_before
//   [test-marker] t902_centred_after_relayout

var T902_WINDOW = 'window_scenario_selection'

function t902_centred(tag) {
    var scale = __test_window_ui_scale_for(T902_WINDOW)
    var vw = (screen.width / scale) | 0
    var vh = (screen.height / scale) | 0
    var w = __test_window_pos(T902_WINDOW)
    var want_x = ((vw - 1024) / 2) | 0
    var want_y = ((vh - 768) / 2) | 0
    __log_info_native('[test:902] ' + tag + ': scale ' + scale + ' virtual ' + vw + 'x' + vh + ' window at ' + w.x + ','
        + w.y + ' want ' + want_x + ',' + want_y)
    return scale > 1 && Math.abs(w.x - want_x) <= 1 && Math.abs(w.y - want_y) <= 1
}

function run_test() {
    test_reload_city_session('data/default.map')
    var saved_scale = __display_options_get_scale()
    var desktop_w = screen.width
    var desktop_h = screen.height

    // The Duo's inner screen: a 951x669 window at 67% is its 1420x999 canvas.
    __test_pretend_ios(true)
    __display_options_set_scale(67)
    __test_screen_resize(951, 669)
    __test_pump_frames(3)
    __test_sleep_ms(600)
    __test_pump_frames(3)
    if (t902_centred('before')) {
        __log_marker('t902_centred_before')
    }

    // Another size, as when the Duo turns, then back: each change re-runs the ui_ scripts.
    __test_screen_resize(951, 700)
    __test_pump_frames(2)
    __test_sleep_ms(600)
    __test_pump_frames(3)
    __test_screen_resize(951, 669)
    __test_pump_frames(2)
    __test_sleep_ms(600)
    __test_pump_frames(3)
    if (__test_find_inlog('refresh=windows')) {
        __log_marker('t902_relayout_ran')
    }
    if (t902_centred('after relayout')) {
        __log_marker('t902_centred_after_relayout')
    }

    __test_pretend_ios(false)
    __display_options_set_scale(saved_scale)
    __test_screen_resize(desktop_w, desktop_h)
    __test_pump_frames(3)
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t902_relayout_ran')
        && __test_find_inlog('[test-marker] t902_centred_after_relayout')
}
