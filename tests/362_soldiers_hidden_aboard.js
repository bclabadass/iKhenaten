// Soldiers aboard a transport aren't drawn over the ship; the company's standard still shows (Brendan on the Duo:
// the company's soldiers piled on the ship while it carried them). Boarding and every tick aboard marked them
// visible; they are hidden now, and shown again when they land.
// Markers:
//   [test-marker] soldiers_hidden_aboard
//   [test-marker] soldiers_shown_after_landing

function t362_visible_soldiers(company) {
    var shown = 0, hidden = 0
    for (var f = 1; f < MAX_FIGURES; f++) {
        if (!__figure_is_valid(f) || __test_figure_get_formation_id(f) != company) {
            continue
        }
        if (__figure_get_type(f) == FIGURE_STANDARD_BEARER || !__test_figure_is_alive(f)) {
            continue
        }
        if (__test_figure_is_visible(f) == 1) {
            shown++
        } else {
            hidden++
        }
    }
    return { shown: shown, hidden: hidden }
}

function run_test() {
    test_reload_city_session('data/default.map')
    var ship = __test_player_transport_spawn_for_embark(4)
    var company = __test_player_transport_company_id()
    if (!ship || !company) {
        __log_info_native('[test:362] setup failed')
        __test_signal_ready()
        return
    }
    var st = __figure_get_tile(ship)
    var flag = test_figure_create(FIGURE_STANDARD_BEARER, st.x, st.y - 2)
    __test_figure_set_formation_id(flag, company)

    __transport_ship_embark(ship, company)
    for (var i = 0; i < 40 && !__transport_ship_has_troops(ship); i++) {
        __test_figure_action_perform(ship)
    }
    __test_pump_frames(30)
    var aboard = t362_visible_soldiers(company)
    var flag_shown = __test_figure_is_visible(flag)
    __log_info_native('[test:362] aboard ' + __transport_ship_has_troops(ship) + ': soldiers shown ' + aboard.shown
        + ', hidden ' + aboard.hidden + '; standard shown ' + flag_shown)
    if (__transport_ship_has_troops(ship) && aboard.shown == 0 && aboard.hidden > 0 && flag_shown == 1) {
        __log_marker('soldiers_hidden_aboard')
    }

    __transport_ship_sail_to(ship, st.x, st.y)
    for (var j = 0; j < 20 && __transport_ship_has_troops(ship); j++) {
        __test_figure_action_perform(ship)
    }
    __test_pump_frames(2)
    var landed = t362_visible_soldiers(company)
    __log_info_native('[test:362] landed ' + !__transport_ship_has_troops(ship) + ': soldiers shown ' + landed.shown
        + ', hidden ' + landed.hidden)
    if (!__transport_ship_has_troops(ship) && landed.hidden == 0 && landed.shown > 0) {
        __log_marker('soldiers_shown_after_landing')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] soldiers_hidden_aboard')
        && __test_find_inlog('[test-marker] soldiers_shown_after_landing')
}
