// Undoing a temple complex refunded 2 marble (a Caesar III oracle leftover: placing a complex takes none) through
// city_storageyards_add_resource, whose loop tested add_resource as a bool: -1 from a yard that refuses marble kept it
// going forever (Brendan on the Duo, Selima: undoing the Seth complex froze the game until iOS killed it). A yard that
// took marble got 100 for free. Undo now refunds nothing, and the loop stops when a yard won't take more.
// Markers:
//   [test-marker] undo_complex_no_free_marble
//   [test-marker] undo_complex_refusing_yard_returns

var __test394_ok = false

function t394_fail(msg) {
    __log_info_native('[test:394] FAIL ' + msg)
    __test_signal_ready()
}

function t394_place_and_undo(yard_state) {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_STORAGE_YARD, true)
    __scenario_building_allow(BUILDING_TEMPLE_COMPLEX_SETH, true)
    var yard = test_building_place(BUILDING_STORAGE_YARD, -1, -1)
    if (!yard || !__test_storage_yard_set_state(yard, RESOURCE_MARBLE, yard_state)) {
        return -1
    }
    var complex = test_building_place(BUILDING_TEMPLE_COMPLEX_SETH, -1, -1)
    if (!complex) {
        return -2
    }
    __ui_game_undo_perform()
    __test_run_ticks(20)
    return __test_yards_stored(RESOURCE_MARBLE)
}

function run_test() {
    __log_info_native('[test:394] undo a temple complex')

    var accepted = t394_place_and_undo(STORAGE_STATE_ACCEPT)
    __log_info_native('[test:394] yard accepting marble: marble after undo ' + accepted)
    if (accepted != 0) {
        return t394_fail('undo put ' + accepted + ' marble in an accepting yard')
    }
    __log_marker('undo_complex_no_free_marble')

    var refused = t394_place_and_undo(STORAGE_STATE_REFUSE)
    __log_info_native('[test:394] yard refusing marble: undo returned, marble ' + refused)
    if (refused != 0) {
        return t394_fail('refusing yard: ' + refused)
    }
    __log_marker('undo_complex_refusing_yard_returns')

    __test394_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test394_ok && __test_find_inlog('[test-marker] undo_complex_no_free_marble')
        && __test_find_inlog('[test-marker] undo_complex_refusing_yard_returns')
}
