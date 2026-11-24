// The Overseer of Monuments' "no monuments" and "no burial provisions" lines drew as "??53.69?" and "??199.12?": a label
// does not expand "${group.id}", so the reference showed raw (Brendan, build 14142). They name their text group now.
// Markers:
//   [test-marker] t916_empty_lines_read
//   [test-marker] t916_no_data_skipped

function run_test() {
    test_reload_city_session('data/default.map')
    __test_burial_provisions_clear()
    city.set_advisor_available(ADVISOR_MONUMENTS, 1)
    game.last_advisor = ADVISOR_MONUMENTS
    window_advisors_show()
    __test_pump_frames(4)
    var W = 'advisor_monuments_window'
    var monuments = String(__test_window_element_text(W, 'no_monuments'))
    var burial = String(__test_window_element_text(W, 'no_burial'))
    __log_info_native('[test:916] no_monuments [' + monuments + '] no_burial [' + burial + ']')
    if (__loc(53, 69) == '' || __loc(53, 69).indexOf('?') >= 0) {
        __log_marker('t916_no_data_skipped')
    } else if (monuments == __loc(53, 69) && burial == __loc(199, 12)) {
        __log_marker('t916_empty_lines_read')
    }
    ui.window_city_show()
    __test_pump_frames(2)
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t916_empty_lines_read')
        || __test_find_inlog('[test-marker] t916_no_data_skipped')
}
