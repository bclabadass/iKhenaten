// The mission selection's prior results on the inner screen (Brendan, build 14143, Nubt): the mission's intro
// sentence and the results were two texts at one spot and overlapped; the difficulty read "?153.3" (text group 153
// is not in the data); a debug "Fileschema: 171" line showed top left; and the minimap showed only a corner of the
// map: it is drawn to the canvas and copied back at its pixel size, and inside the 1.5x pop-up it was drawn larger
// than the copy. The results are one text, the difficulty is named, the schema line shows only with the debug
// properties on, and the preview is built at canvas scale.
// Markers:
//   [test-marker] t914_results_one_text
//   [test-marker] t914_difficulty_named
//   [test-marker] t914_schema_hidden
//   [test-marker] t914_minimap_at_canvas_scale

var T914_FAMILY = 'T914'

function run_test() {
    test_reload_city_session('data/default.map')
    __game_load_player_data('')
    game.dynasty_name = T914_FAMILY
    __game_delete_savegame('progress.dat')
    __game_player_record_mission_win(0)
    __game_load_player_data(T914_FAMILY)

    __test_pretend_ios(true)
    __display_options_set_scale(67)
    __test_screen_resize(951, 669)
    __test_pump_frames(3)
    window_scenario_selection.free_play = false
    window_show_by_id('window_scenario_selection')
    __test_pump_frames(3)
    __game_load_mission(0, 0)
    emit window_scenario_selection.mission_changed { id: scenario.campaign_scenario_id }
    window_scenario_selection.scores_or_goals = 0
    emit window_scenario_selection.show_scores { }
    __test_pump_frames(5)

    var W = 'window_scenario_selection'
    var intro = String(__test_window_element_text(W, 'side_scores_intro'))
    var body = String(__test_window_element_text(W, 'side_scores_body'))
    var schema_shown = __test_window_element_enabled(W, 'debug_file_schema')
    var scale = __test_minimap_preview_built_scale()
    __log_info_native('[test:914] window ' + __game_window_get_id() + ', beaten ' + __game_mission_scenario_beaten(0)
        + ', intro [' + intro + '], schema shown ' + schema_shown + ', minimap built at ' + scale + '%')
    __log_info_native('[test:914] results [' + body.split('\n').join(' | ') + ']')

    if (intro == '' && body.indexOf(__loc(298, 8)) >= 0 && body.indexOf('?') < 0) {
        __log_marker('t914_results_one_text')
    }
    if (body.indexOf(__loc(298, 7) + ' ' + __loc('#difficulty_normal')) >= 0
        || body.indexOf(__loc(298, 7) + ' ' + __loc('#difficulty_easy')) >= 0
        || body.indexOf(__loc(298, 7) + ' ' + __loc('#difficulty_very_easy')) >= 0
        || body.indexOf(__loc(298, 7) + ' ' + __loc('#difficulty_hard')) >= 0
        || body.indexOf(__loc(298, 7) + ' ' + __loc('#difficulty_very_hard')) >= 0) {
        __log_marker('t914_difficulty_named')
    }
    if (schema_shown == 0) {
        __log_marker('t914_schema_hidden')
    }
    if (scale == 100) {
        __log_marker('t914_minimap_at_canvas_scale')
    }

    __display_options_set_scale(100)
    __test_pretend_ios(false)
    __test_screen_resize(800, 600)
    __game_delete_savegame('progress.dat')
    __game_load_player_data('')
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    var markers = ['t914_results_one_text', 't914_difficulty_named', 't914_schema_hidden', 't914_minimap_at_canvas_scale']
    for (var i = 0; i < markers.length; i++) {
        if (!__test_find_inlog('[test-marker] ' + markers[i])) {
            __log_info_native('[test:914] missing ' + markers[i])
            return false
        }
    }
    return true
}
