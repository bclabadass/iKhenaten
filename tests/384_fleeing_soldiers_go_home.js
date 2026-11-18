// Soldiers of a company with low morale flee home (Selima, Duo saves "DuoSaves/Selima 7"): the company update puts them
// in FIGURE_ACTION_148_FLEEING, but the soldier had no case for it, so they stood in the field, never reached the
// fort where morale recovers, ignored return-to-fort (re-set to fleeing every update) and the panic spread.
// Also a troops request posted its amount like goods (< 100 → ×100): Selima's 7 read "700 troops".
// The real-data half needs the Duo save in Save/DuoSaves/; without it that half logs a skip.
// Markers:
//   [test-marker] fleeing_soldiers_reach_home
//   [test-marker] troops_request_amount_kept
//   [test-marker] selima_companies_recover

var T384_SAVE = '../DuoSaves/Selima 7.svx'
var __test384_ok = false

function test384_fail(msg) {
    __log_info_native('[test:384] FAIL ' + msg)
    __test_signal_ready()
}

function test384_soldiers(form) {
    var out = []
    for (var f = 1; f < 3000; f++) {
        if (__figure_is_valid(f) && __test_figure_get_formation_id(f) == form && __figure_get_type(f) == FIGURE_INFANTRY) {
            out.push(f)
        }
    }
    return out
}

function run_test() {
    __log_info_native('[test:384] fleeing soldiers go home')
    test_reload_city_session('data/default.map')

    var company = __test_land_company_create(4)
    var soldiers = test384_soldiers(company)
    if (!company || soldiers.length == 0) {
        return test384_fail('no company')
    }
    var home = city.get_formation(company).tile
    for (var i = 0; i < soldiers.length; i++) {
        __test_figure_set_tile_raw(soldiers[i], home.x + 6, home.y + i)
        __test_figure_set_action(soldiers[i], 148)
    }
    __test_run_ticks(600)
    var states = []
    for (var i = 0; i < soldiers.length; i++) {
        var a = __figure_get_action_state(soldiers[i])
        var t = __figure_get_tile(soldiers[i])
        states.push(a + '@' + (t.x - home.x) + ',' + (t.y - home.y))
        if (a != 0 && a != 1) {
            return test384_fail('soldier still action ' + a + ': ' + JSON.stringify(states))
        }
    }
    __log_info_native('[test:384] soldiers after fleeing: ' + JSON.stringify(states))
    __log_marker('fleeing_soldiers_reach_home')

    __test_post_event_message(RESOURCE_TROOPS, 7, 0, 0, 0)
    var troops = __test_last_message_req_amount()
    __test_post_event_message(RESOURCE_TIMBER, 7, 0, 0, 0)
    var timber = __test_last_message_req_amount()
    if (troops != 7 || timber != 700) {
        return test384_fail('request amounts: troops 7 -> ' + troops + ', timber 7 loads -> ' + timber)
    }
    __log_marker('troops_request_amount_kept')

    if (!__game_load_savegame(T384_SAVE)) {
        __log_info_native('[test:384] skip real-data half: no ' + T384_SAVE)
        __log_marker('selima_companies_recover')
        __test384_ok = true
        __test_signal_ready()
        return
    }
    __test_run_ticks(2000)
    var report = []
    for (var form = 1; form <= 4; form++) {
        var m = city.get_formation(form)
        var fleeing = 0
        var list = test384_soldiers(form)
        for (var i = 0; i < list.length; i++) {
            if (__figure_get_action_state(list[i]) == 148) {
                fleeing++
            }
        }
        report.push('F' + form + ' morale ' + m.morale + ' at fort ' + m.is_at_fort + ' fleeing ' + fleeing)
        if (fleeing || !m.is_at_fort || m.morale <= 0) {
            return test384_fail('Selima: ' + JSON.stringify(report))
        }
    }
    __log_info_native('[test:384] Selima 7 after 2000 ticks: ' + JSON.stringify(report))
    __log_marker('selima_companies_recover')

    __test384_ok = true
    __test_signal_ready()
}

function check_valid() {
    if (!__test384_ok) {
        return false
    }
    var markers = ['fleeing_soldiers_reach_home', 'troops_request_amount_kept', 'selima_companies_recover']
    for (var i = 0; i < markers.length; i++) {
        if (!__test_find_inlog('[test-marker] ' + markers[i])) {
            __log_info_native('[test:384] missing marker: ' + markers[i])
            return false
        }
    }
    return true
}
