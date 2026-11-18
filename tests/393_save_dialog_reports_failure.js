// A save that fails to write closed the save dialog as if it had worked (Brendan on the Duo: "the dialog closes
// but no save exists in the list"). The dialog now stays open and its bottom line says the save failed, and the log gives the
// system's reason. The failure is made real here: a folder sits where the save file would go.
// Markers:
//   [test-marker] save_failure_keeps_dialog
//   [test-marker] save_success_closes_dialog

var T393_BLOCKED = 't393_blocked'
var __test393_ok = false

function t393_fail(msg) {
    __log_info_native('[test:393] FAIL ' + msg)
    __game_delete_savegame(T393_BLOCKED + '.svx/inner.svx')
    __game_delete_savegame(T393_BLOCKED + '.svx')
    __test_signal_ready()
}

function t393_commit(name) {
    window_show_by_id('file_dialog_save')
    __test_pump_frames(3)
    file_dialog_save.show_filename = name
    file_dialog_save_handle_commit({})
    __test_pump_frames(3)
}

function run_test() {
    __log_info_native('[test:393] save dialog reports a failed save')
    test_reload_city_session('data/default.map')
    __test_pump_frames(3)

    // A folder named like the save: writing the .tmp works, replacing the folder with it doesn't.
    if (!__game_write_savegame(T393_BLOCKED + '.svx/inner.svx')) {
        return t393_fail('could not create the blocking folder')
    }
    t393_commit(T393_BLOCKED)
    var still_open = ui.window_is('file_dialog_save')
    var warned = __test_find_inlog('Save failed: ' + T393_BLOCKED + '.svx')
    var reason = __test_find_inlog('could not replace it with')
    var hint = __test_window_element_text('file_dialog_save', 'hint')
    __log_info_native('[test:393] blocked save: dialog open ' + still_open + ', warned ' + warned + ', reason logged ' + reason + ', hint ' + JSON.stringify(hint))
    if (!still_open || !warned || !reason || hint != __loc('#save_failed')) {
        return t393_fail('blocked save closed the dialog or said nothing')
    }
    __log_marker('save_failure_keeps_dialog')
    ui.window_city_show()
    __test_pump_frames(2)

    t393_commit('t393_ok')
    var closed = ui.window_is('window_city')
    __game_delete_savegame('t393_ok.svx')
    if (!closed) {
        return t393_fail('a good save left the dialog open')
    }
    __log_marker('save_success_closes_dialog')

    __game_delete_savegame(T393_BLOCKED + '.svx/inner.svx')
    __game_delete_savegame(T393_BLOCKED + '.svx')
    __test393_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test393_ok && __test_find_inlog('[test-marker] save_failure_keeps_dialog')
        && __test_find_inlog('[test-marker] save_success_closes_dialog')
}
