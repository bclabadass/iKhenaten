// A company's experience shows as it grows and grows from fighting. Experience runs 0-100 (OG LEGION_MAX_EXPERIENCE)
// and the fort panel and the Military overseer show six levels, Green to The best (138.60-65), but took the level
// as experience / 100, so every company read Green until it reached the maximum (Brendan on the Duo: forts don't
// track experience after battles). The levels are now 20 apart (an Academy recruit's 25 is Skilled). Also, only
// javelin kills added experience; the manual says "All soldiers who survive a battle gain experience from
// fighting", and a hand-to-hand kill now adds 1 as a javelin kill does.
// Markers:
//   [test-marker] experience_levels_shown
//   [test-marker] melee_kill_adds_experience

function t353_place(type) {
    if (!__scenario_building_allowed(type)) {
        __scenario_building_allow(type, true)
    }
    var bid = test_building_place(type, -1, -1)
    test_planner_exit_build_mode()
    return bid
}

function t353_archers() {
    var out = []
    for (var f = 1; f < 3000; f++) {
        if (__figure_is_valid(f) && __figure_get_type(f) == FIGURE_ARCHER) {
            out.push(f)
        }
    }
    return out
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_FORT_GROUND, true)
    var recruiter = t353_place(BUILDING_RECRUITER)
    var fort = t353_place(BUILDING_FORT_ARCHERS)
    __test_fort_update_recruit_status(fort)
    __test_recruiter_create_soldier(recruiter)
    __test_pump_frames(3)
    var form_id = fort ? city.get_building(fort).formation_id : 0
    if (!form_id) {
        __log_info_native('[test:353] no company')
        __test_signal_ready()
        return
    }

    var want = [[0, 60], [19, 60], [25, 61], [45, 62], [65, 63], [85, 64], [100, 65]]
    var wrong = []
    for (var i = 0; i < want.length; i++) {
        __test_formation_set_experience(form_id, want[i][0])
        __test_show_company_orders(fort)
        __test_pump_frames(3)
        var shown = __test_info_ui_text('training_num')
        if (shown != __loc(138, want[i][1])) {
            wrong.push(want[i][0] + ':' + shown)
        }
        ui.window_city_show()
        __test_pump_frames(2)
    }
    __log_info_native('[test:353] experience shown wrong: ' + JSON.stringify(wrong))
    if (wrong.length == 0) {
        __log_marker('experience_levels_shown')
    }

    // An archer finishing off a foe hand to hand.
    __test_formation_set_experience(form_id, 30)
    var soldier = t353_archers()[0]
    var tile = __figure_get_tile(soldier)
    var foe = test_figure_create(FIGURE_ENEMY_EGYPTIAN_SWORD, tile.x, tile.y)
    __test_figure_set_damage(foe, 500)
    __test_figure_attack_figure_at(soldier, tile.x, tile.y)
    for (var t = 0; t < 40 && __test_figure_is_alive(foe); t++) {
        __test_figure_action_perform(soldier)
    }
    var after = city.get_formation(form_id).experience
    __log_info_native('[test:353] foe killed hand to hand: ' + !__test_figure_is_alive(foe) + ', experience 30 -> ' + after)
    if (!__test_figure_is_alive(foe) && after == 31) {
        __log_marker('melee_kill_adds_experience')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] experience_levels_shown')
        && __test_find_inlog('[test-marker] melee_kill_adds_experience')
}
