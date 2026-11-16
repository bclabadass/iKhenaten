// Each early mission opens with the how-to the original gives it. Pharaoh_MM.txt labels them "MISSION nn FIRST
// TUTORIAL": 249 Nubt, 241 Thinis, 242 Perwadjyt, 243 Nekhen, 244 Men-nefer ("Getting Started"), 245 Timna
// ("Soldiers and Forts"), 246 Behdet and 247 Abedju (both "At the Water's Edge"; 247 adds making bricks), 248 Selima,
// 284 Abu ("The Finer Things"), 285 Saqqara ("Innovations"). Behdet and Abedju opened with 245, Men-nefer with 246,
// and Timna, Abu and Saqqara with a history text (Abu's and Saqqara's are their briefings, shown before the city).
// Markers:
//   [test-marker] first_tutorials_match_original

var T341_FIRST_TUTORIAL = [249, 241, 242, 243, 244, 245, 246, 247, 248, 284, 285]

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
    if (ui.window_is('window_message_dialog')) {
        window_go_back()
    }
    __test_pump_frames(2)
    return { key: key, id: key ? __lang_get_message_uid(key) : -1 }
}

function run_test() {
    var wrong = []
    for (var m = 0; m < T341_FIRST_TUTORIAL.length; m++) {
        var got = t341_first_message(m)
        __log_info_native('[test:341] mission ' + m + ' starts with ' + got.key + ' (' + got.id + '), original '
            + T341_FIRST_TUTORIAL[m])
        if (got.id != T341_FIRST_TUTORIAL[m]) {
            wrong.push(m)
        }
    }
    __log_info_native('[test:341] missions with another first message: ' + JSON.stringify(wrong))
    if (wrong.length == 0) {
        __log_marker('first_tutorials_match_original')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] first_tutorials_match_original')
}
