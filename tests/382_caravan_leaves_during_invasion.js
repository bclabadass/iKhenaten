// Trade caravans during an invasion (Selima, Duo saves "DuoSaves/Selima 3..5"): every tick re-pointed leaving
// caravans at the exit and turned them north, so they walked off the top edge and got lost; a lost caravan then
// bounced between LEAVING and RECALC_LEAVING forever, holding its city's trader slot (no more imports from it).
// The real-data half needs the Duo save in Save/DuoSaves/; without it that half logs a skip.
// Markers:
//   [test-marker] caravan_invasion_redirect_ok
//   [test-marker] caravan_leaving_kept_ok
//   [test-marker] caravan_lost_removed_ok
//   [test-marker] caravan_selima_ok

// Saves live under --user-dir in tests; the Duo saves stay in the Pharaoh folder's Save/DuoSaves/.
var T382_SAVE = __test_data_dir() + '/Save/DuoSaves/Selima 5.svx'
var __test382_ok = false

function test382_fail(msg) {
    __log_info_native('[test:382] FAIL ' + msg)
    __test_signal_ready()
}

function test382_caravan(x, y) {
    return test_figure_create(FIGURE_TRADE_CARAVAN, x, y)
}

function run_test() {
    __log_info_native('[test:382] caravans leave once during an invasion')
    test_reload_city_session('data/default.map')
    city.figures.remove_figures(FIGURE_TRADE_CARAVAN)

    var cx = (__scenario_map.width / 2) | 0
    var cy = (__scenario_map.height / 2) | 0
    var enemy = test_figure_create(FIGURE_ENEMY_EGYPTIAN_ELEPHANT, cx + 10, cy + 10)
    if (!enemy) {
        return test382_fail('enemy spawn failed')
    }
    __test_run_ticks(1)

    // Control: an arriving caravan is sent home when invaders are in the city.
    var arriving = test382_caravan(cx, cy)
    if (!arriving) {
        return test382_fail('caravan spawn failed')
    }
    __test_figure_set_action(arriving, 1)
    __test_figure_action_perform(arriving)
    var a = __figure_get_action_state(arriving)
    if (a != 3 && a != 4 && __test_figure_is_alive(arriving)) {
        return test382_fail('arriving caravan want leaving (3/4), got ' + a)
    }
    __log_marker('caravan_invasion_redirect_ok')

    // A caravan already leaving keeps its route instead of being re-pointed (and turned north) every tick.
    var leaving = test382_caravan(cx - 4, cy - 4)
    __test_figure_set_action(leaving, 3)
    __test_figure_set_destination_tile(leaving, cx - 4, cy + 6)
    __test_figure_action_perform(leaving)
    var dt = __figure_get_destination_tile(leaving)
    if (__test_figure_is_alive(leaving) && (dt.x != cx - 4 || dt.y != cy + 6)) {
        return test382_fail('leaving caravan re-pointed to ' + JSON.stringify(dt))
    }
    __log_marker('caravan_leaving_kept_ok')

    // Lost on the way out twice (the second time already heading for the exit) → removed, as OG.
    city.figures.remove_figures(FIGURE_ENEMY_EGYPTIAN_ELEPHANT)
    __test_run_ticks(1)
    var lost = test382_caravan(cx + 3, cy - 3)
    __test_figure_set_destination_tile(lost, cx + 3, cy - 1)
    for (var i = 0; i < 2 && __test_figure_is_alive(lost); i++) {
        __test_figure_set_action(lost, 4)
        __test_figure_set_direction(lost, 10)
        __test_figure_action_perform(lost)
    }
    if (__test_figure_is_alive(lost)) {
        return test382_fail('lost caravan still alive, action ' + __figure_get_action_state(lost))
    }
    __log_marker('caravan_lost_removed_ok')

    if (!__game_load_savegame(T382_SAVE)) {
        __log_info_native('[test:382] skip real-data half: no ' + T382_SAVE)
        __log_marker('caravan_selima_ok')
        __test382_ok = true
        __test_signal_ready()
        return
    }
    var offmap = 0
    __test_run_ticks(500)
    for (var f = 1; f < 2000; f++) {
        if (__figure_get_type(f) == FIGURE_TRADE_CARAVAN && __test_figure_is_alive(f) && __figure_get_tile(f).y < 0) {
            offmap++
        }
    }
    if (offmap) {
        return test382_fail('Selima: ' + offmap + ' caravans still lost off the map')
    }
    __log_marker('caravan_selima_ok')

    __test382_ok = true
    __test_signal_ready()
}

function check_valid() {
    if (!__test382_ok) {
        return false
    }
    var markers = ['caravan_invasion_redirect_ok', 'caravan_leaving_kept_ok', 'caravan_lost_removed_ok', 'caravan_selima_ok']
    for (var i = 0; i < markers.length; i++) {
        if (!__test_find_inlog('[test-marker] ' + markers[i])) {
            __log_info_native('[test:382] missing marker: ' + markers[i])
            return false
        }
    }
    return true
}
