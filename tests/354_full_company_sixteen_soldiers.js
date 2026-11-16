// A full company is 16 soldiers. The company count took every living figure with its formation id, the standard
// bearer too, so a company "of 16" was 15 soldiers and the flag, and the recruiter stopped there (Brendan on the
// Duo: forts show 15 soldiers while the fort reports 16; Abdjedu 11 had two archer companies of 15 archers each).
// The standard bearer isn't counted now.
// Markers:
//   [test-marker] company_fills_to_sixteen

function t354_place(type) {
    if (!__scenario_building_allowed(type)) {
        __scenario_building_allow(type, true)
    }
    var bid = test_building_place(type, -1, -1)
    test_planner_exit_build_mode()
    return bid
}

function t354_count(type, form_id) {
    var n = 0
    for (var f = 1; f < 3000; f++) {
        if (__figure_is_valid(f) && __test_figure_is_alive(f) && __figure_get_type(f) == type
            && __test_figure_get_formation_id(f) == form_id) {
            n++
        }
    }
    return n
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_FORT_GROUND, true)
    var recruiter = t354_place(BUILDING_RECRUITER)
    var fort = t354_place(BUILDING_FORT_ARCHERS)
    var form_id = fort ? city.get_building(fort).formation_id : 0
    if (!recruiter || !form_id) {
        __log_info_native('[test:354] setup failed')
        __test_signal_ready()
        return
    }
    // Each recruit stands at rest beside the fort (without a road it would set out from tile 0,0 and be lost).
    var ft = __building_tile(fort)
    var placed = 0
    for (var i = 0; i < 24; i++) {
        __test_fort_update_recruit_status(fort)
        __test_recruiter_create_soldier(recruiter)
        for (var q = 1; q < 3000; q++) {
            if (__figure_is_valid(q) && __figure_get_type(q) == FIGURE_ARCHER && __figure_get_action_state(q) != 0) {
                __test_figure_place(q, ft.x + (placed % 6), ft.y + 6 + ((placed / 6) | 0))
                __test_figure_set_action(q, 0)
                placed++
            }
        }
        __test_pump_frames(2)
    }
    __test_pump_frames(4)
    var archers = t354_count(FIGURE_ARCHER, form_id)
    var bearers = t354_count(FIGURE_STANDARD_BEARER, form_id)
    var reported = city.get_formation(form_id).num_figures
    __log_info_native('[test:354] after 24 recruits: archers ' + archers + ', standard bearers ' + bearers
        + ', company reports ' + reported)
    if (archers == 16 && reported == 16) {
        __log_marker('company_fills_to_sixteen')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] company_fills_to_sixteen')
}
