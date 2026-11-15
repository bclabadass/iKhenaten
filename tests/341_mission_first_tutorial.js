// Behdet and Abedju open with the how-to the original gives them. Both opened with "Soldiers and Forts" (245),
// Timna's how-to. Pharaoh_MM.txt labels each mission's first tutorial: 246 "MISSION 06 FIRST TUTORIAL" and 247
// "MISSION 07 FIRST TUTORIAL", both "At the Water's Edge" (trade on the water, fishing, boats and ships; 247 adds
// making bricks).
// Markers:
//   [test-marker] behdet_first_tutorial
//   [test-marker] abedju_first_tutorial

var t341_popups = []
var t341_popup_message = ui.popup_message
ui.popup_message = function(key) {
    t341_popups.push(key)
    t341_popup_message(key)
}

// The id of the first message the mission pops up when it starts.
function t341_first_message(scenario_id) {
    t341_popups = []
    __game_load_mission(scenario_id, 1)
    __test_process_events()
    __test_pump_frames(4)
    var key = t341_popups.length ? t341_popups[0] : ''
    var id = key ? __lang_get_message_uid(key) : -1
    __log_info_native('[test:341] mission ' + scenario_id + ' starts with ' + key + ' (' + id + '), shown flag '
        + mission.start_message_shown)
    if (ui.window_is('window_message_dialog')) {
        window_go_back()
    }
    __test_pump_frames(2)
    return id
}

function run_test() {
    if (t341_first_message(6) == 246) {
        __log_marker('behdet_first_tutorial')
    }
    if (t341_first_message(7) == 247) {
        __log_marker('abedju_first_tutorial')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] behdet_first_tutorial')
        && __test_find_inlog('[test-marker] abedju_first_tutorial')
}
