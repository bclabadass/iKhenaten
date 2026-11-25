// Mission selection (Brendan, 2026-11-25, On): every mission read "No military activity"; with three monuments the
// last one ran under the button; and the button's two labels were swapped ("Show Mission Objectives" while the
// objectives were showing). The military line counts the mission's raids as the original does (0x41E3B0: invasions
// less Pharaoh's army sent when the kingdom rating falls to 0, thresholds 0 / 2 / 4 / 10); the campaign keeps them in
// mission<N>_raid_list(). The monuments end above the button, and the button names the view it switches to.
// Markers:
//   [test-marker] t926_military_follows_raids
//   [test-marker] t926_monuments_clear_button
//   [test-marker] t926_button_names_other_view

var W926 = 'window_scenario_selection'

function t926_show(sid) {
    __game_load_mission(sid, 0)
    emit window_scenario_selection.mission_changed { id: scenario.campaign_scenario_id }
    __test_pump_frames(2)
}

// The lowest pixel row the monuments reach: one line per monument, 16 apart (or the old multiline body's 20).
function t926_monuments_bottom() {
    var bottom = 0
    for (var i = 0; i < 3; i++) {
        var id = 'info_monument_' + i
        if (__test_window_element_enabled(W926, id) == 1 && __test_window_element_text(W926, id) != '') {
            bottom = Math.max(bottom, __test_window_element_pos(W926, id).y + 16)
        }
    }
    if (__test_window_element_enabled(W926, 'info_monuments_body') == 1) {
        var lines = String(__test_window_element_text(W926, 'info_monuments_body')).split('\n').length
        bottom = Math.max(bottom, __test_window_element_pos(W926, 'info_monuments_body').y + lines * 20)
    }
    return bottom
}

function run_test() {
    if (!__game_has_campaign_data()) {
        __log_marker('t926_military_follows_raids')
        __log_marker('t926_monuments_clear_button')
        __log_marker('t926_button_names_other_view')
        __test_signal_ready()
        return
    }
    test_reload_city_session('data/default.map')
    window_scenario_selection.free_play = false
    window_scenario_selection.individual_missions = true
    window_show_by_id(W926)
    __test_pump_frames(3)

    // Saqqara: only Pharaoh's army; Abedju 1 raid; Timna 3; Buhen 8; Bahariya 21.
    var want = [[10, 112], [7, 113], [5, 114], [13, 115], [19, 116]]
    var military_ok = true
    var got = []
    for (var i = 0; i < want.length; i++) {
        t926_show(want[i][0])
        var line = String(__test_window_element_text(W926, 'info_line_invasion'))
        got.push(want[i][0] + ':' + line)
        military_ok = military_ok && line == __loc(44, want[i][1])
    }

    // On: 4 goals and 3 monuments; Itjtawy: 5 goals and 3 monuments.
    var btn = __test_window_element_pos(W926, 'btn_scores')
    var btn_size = __test_window_element_size(W926, 'btn_scores')
    var start = __test_window_element_pos(W926, 'btn_start')
    var fit_ok = btn.x + btn_size.x <= start.x && btn.y + btn_size.y <= 612
    var fit = []
    var sids = [17, 27]
    for (var k = 0; k < sids.length; k++) {
        t926_show(sids[k])
        var bottom = t926_monuments_bottom()
        fit.push(sids[k] + ': monuments end ' + bottom)
        fit_ok = fit_ok && bottom > 0 && bottom <= btn.y && bottom <= 580
    }

    var goals_label = String(__test_window_element_text(W926, 'btn_scores'))
    emit window_scenario_selection.show_scores { }
    __test_pump_frames(2)
    var scores_label = String(__test_window_element_text(W926, 'btn_scores'))
    var scores_shown = __test_window_element_enabled(W926, 'side_scores_body') == 1
    emit window_scenario_selection.show_scores { }
    __test_pump_frames(2)

    __log_info_native('[test:926] military ' + got.join(' | '))
    __log_info_native('[test:926] button at ' + btn.x + ',' + btn.y + ' size ' + btn_size.x + 'x' + btn_size.y + ', start at '
        + start.x + ',' + start.y + '; ' + fit.join('; '))
    __log_info_native('[test:926] objectives showing, button [' + goals_label + ']; results showing (' + scores_shown
        + '), button [' + scores_label + ']')
    if (military_ok) {
        __log_marker('t926_military_follows_raids')
    }
    if (fit_ok) {
        __log_marker('t926_monuments_clear_button')
    }
    if (goals_label == __loc(44, 220) && scores_shown && scores_label == __loc(44, 221)) {
        __log_marker('t926_button_names_other_view')
    }
    window_go_back()
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t926_military_follows_raids')
        && __test_find_inlog('[test-marker] t926_monuments_clear_button')
        && __test_find_inlog('[test-marker] t926_button_names_other_view')
}
