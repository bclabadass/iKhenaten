// An overseer's background fills the inner screen as it does a desktop window of the same canvas. The background was
// fitted when the batched UI commands replayed, when the screen size is the canvas again but the pop-up's render scale
// (1.5 on the inner screen) still applies, so the picture came out 1.5x too large: the overseers and the title screen
// zoomed in (Brendan, build 14142, after the 2026-11-22 upstream merge moved backgrounds into the batch).
// Without the Pharaoh data there is no picture (a plain fill), so the test logs a skip.
// Markers:
//   [test-marker] t913_background_matches_desktop
//   [test-marker] t913_no_data_skipped

function t913_sample(tag) {
    city.set_advisor_available(ADVISOR_MONUMENTS, 1)
    game.last_advisor = ADVISOR_MONUMENTS
    window_advisors_show()
    __test_pump_frames(10)
    var r = __test_last_background_rect()
    __log_info_native('[test:913] ' + tag + ' canvas ' + screen.width + 'x' + screen.height + ' background at ' + r)
    ui.window_city_show()
    __test_pump_frames(2)
    return r
}

function run_test() {
    test_ensure_city_session('data/default.map')
    __test_screen_resize(1420, 999)
    __test_pump_frames(4)
    var desktop = t913_sample('desktop')
    if (desktop == '0,0,0,0') {
        __log_marker('t913_no_data_skipped')
        __test_screen_resize(800, 600)
        __test_signal_ready()
        return
    }
    __test_pretend_ios(true)
    __display_options_set_scale(67)
    __test_screen_resize(951, 669)
    __test_pump_frames(30)
    var inner = t913_sample('inner')
    __display_options_set_scale(100)
    __test_pretend_ios(false)
    __test_screen_resize(800, 600)
    __test_pump_frames(4)

    // Within a canvas pixel or two: the inner screen fits a 946x666 virtual screen and draws it 1.5x.
    var d = desktop.split(',')
    var n = inner.split(',')
    var close = +d[2] > 0
    for (var i = 0; i < 4; i++) {
        close = close && Math.abs(+d[i] - +n[i]) <= 2
    }
    if (close) {
        __log_marker('t913_background_matches_desktop')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t913_background_matches_desktop')
        || __test_find_inlog('[test-marker] t913_no_data_skipped')
}
