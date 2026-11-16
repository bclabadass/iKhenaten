// A boarding that can't finish can be called off (Brendan on the Duo: a hippo fought one of the company's soldiers on
// the way to the transport and the boarding stalled; Return to Fort on the company worked, but the transport kept
// Embark greyed, so it waited for the company for good). A company assigned to board kept the ship from taking
// another company, and nothing dropped the assignment. Now Embark stays open while a company is only assigned
// (picking a company again replaces it), any other order to the ship calls the boarding off, and the ship stops
// waiting when the company is sent elsewhere.
// Markers:
//   [test-marker] embark_open_while_waiting
//   [test-marker] hold_calls_boarding_off
//   [test-marker] ship_stops_waiting_for_recalled_company

function t365_setup() {
    test_reload_city_session('data/default.map')
    var ship = __test_player_transport_spawn_for_embark(4)
    var company = __test_player_transport_company_id()
    if (!ship || !company) {
        return null
    }
    // The company stands well inland, so it has to walk to the ship.
    var st = __figure_get_tile(ship)
    var n = 0
    for (var f = 1; f < MAX_FIGURES; f++) {
        if (__figure_is_valid(f) && __test_figure_get_formation_id(f) == company && __figure_get_type(f) != FIGURE_STANDARD_BEARER) {
            __test_figure_place(f, st.x + n, st.y - 14)
            __test_figure_set_action(f, 4)
            n++
        }
    }
    __transport_ship_embark(ship, company)
    for (var k = 0; k < 3; k++) {
        __test_figure_action_perform(ship)
    }
    return { ship: ship, company: company }
}

function t365_battalion(company) {
    var batalion = city.get_formation(company).batalion_id
    for (var i = 0; i < 6; i++) {
        var b = city.get_battalion_by_index(i)
        if (b.batalion_id == batalion && b.num_figures > 0) {
            return b
        }
    }
    return null
}

function run_test() {
    var s = t365_setup()
    if (!s) {
        __log_info_native('[test:365] setup failed')
        __test_signal_ready()
        return
    }
    var ship = city.get_transport_ship(s.ship)
    var waiting = __figure_get_action_state(s.ship)
    __log_info_native('[test:365] company walking to board: ship action ' + waiting + ', aboard ' + ship.has_troops
        + ', Embark open ' + ship.can_embark)
    if (waiting == 218 && !ship.has_troops && ship.can_embark) {
        __log_marker('embark_open_while_waiting')
    }

    ship.set_order(TRANSPORT_ORDER_HOLD)
    for (var k = 0; k < 5; k++) {
        __test_figure_action_perform(s.ship)
    }
    __test_pump_frames(200)
    var after_hold = __figure_get_action_state(s.ship)
    __log_info_native('[test:365] after Hold: ship action ' + after_hold + ', aboard ' + ship.has_troops + ', Embark open '
        + ship.can_embark)
    if (after_hold != 218 && !ship.has_troops && ship.can_embark) {
        __log_marker('hold_calls_boarding_off')
    }

    s = t365_setup()
    var b = s ? t365_battalion(s.company) : null
    if (b) {
        b.return_home()
        for (var j = 0; j < 10; j++) {
            __test_figure_action_perform(s.ship)
        }
        var after_return = __figure_get_action_state(s.ship)
        __log_info_native('[test:365] company sent back to its fort: ship action ' + after_return + ', Embark open '
            + city.get_transport_ship(s.ship).can_embark)
        if (after_return != 218) {
            __log_marker('ship_stops_waiting_for_recalled_company')
        }
    } else {
        __log_info_native('[test:365] no battalion for the company')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] embark_open_while_waiting')
        && __test_find_inlog('[test-marker] hold_calls_boarding_off')
        && __test_find_inlog('[test-marker] ship_stops_waiting_for_recalled_company')
}
