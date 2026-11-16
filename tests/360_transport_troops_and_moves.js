// Troops ride a transport and land alive, and a transport takes more than one move (Brendan on the Duo, Abdjedu:
// the company died on boarding, the transport moved once and then ignored moves, and a hull animation flashed over
// the wharf while the ship was docked).
// - A figure that can't swim dies on a water tile; soldiers aboard stand on the ship's tile, so the whole company
//   drowned as it boarded. Soldiers aboard, and the standard of a company aboard, are now left alone.
// - A company resting in its fort counted as lined up to board (standing still), so it boarded from across the map
//   without walking. It now walks to the shore nearest the ship that it can reach, and the ship sails beside it
//   (boats can't route along the bank, so up to two tiles out).
// - A ship at rest reads as arrived until it next reaches a tile centre, so a move given then was dropped.
// - The transport and warship wharves' dock worker (SprAmbient 47, one facing, 24 images) stepped four images a
//   frame, as the four-facing wharf groups do, and ran on into the hulls and cargo of the next groups.
// Markers:
//   [test-marker] troops_survive_aboard
//   [test-marker] company_walks_before_boarding
//   [test-marker] second_move_sails
//   [test-marker] wharf_worker_stays_in_group

function t360_company_figures(company) {
    var out = []
    for (var f = 1; f < MAX_FIGURES; f++) {
        if (__figure_is_valid(f) && __test_figure_get_formation_id(f) == company && __test_figure_is_alive(f)) {
            out.push(f)
        }
    }
    return out
}

function t360_ship_with_troops() {
    test_reload_city_session('data/default.map')
    var ship = __test_player_transport_spawn_for_embark(4)
    var company = __test_player_transport_company_id()
    if (!ship || !company) {
        return null
    }
    var flag = test_figure_create(FIGURE_STANDARD_BEARER, __figure_get_tile(ship).x, __figure_get_tile(ship).y - 2)
    __test_figure_set_formation_id(flag, company)
    return { ship: ship, company: company, flag: flag }
}

function t360_aboard() {
    var s = t360_ship_with_troops()
    if (!s) {
        __log_info_native('[test:360] transport setup failed')
        return
    }
    __transport_ship_embark(s.ship, s.company)
    for (var i = 0; i < 40 && !__transport_ship_has_troops(s.ship); i++) {
        __test_figure_action_perform(s.ship)
    }
    var before = t360_company_figures(s.company).length
    __test_pump_frames(60)
    var after = t360_company_figures(s.company).length
    __log_info_native('[test:360] aboard ' + __transport_ship_has_troops(s.ship) + ': company figures alive ' + before
        + ' -> ' + after + ' after 60 frames, standard alive ' + __test_figure_is_alive(s.flag))
    if (__transport_ship_has_troops(s.ship) && before > 0 && after == before && __test_figure_is_alive(s.flag)) {
        __log_marker('troops_survive_aboard')
    }
}

function t360_walks() {
    var s = t360_ship_with_troops()
    if (!s) {
        return
    }
    // The company stands still well inland, as at rest in its fort.
    var st = __figure_get_tile(s.ship)
    var soldiers = t360_company_figures(s.company)
    var n = 0
    for (var i = 0; i < soldiers.length; i++) {
        if (__figure_get_type(soldiers[i]) != FIGURE_STANDARD_BEARER) {
            __test_figure_place(soldiers[i], st.x + n, st.y - 14)
            __test_figure_set_action(soldiers[i], 4) // at their standard, standing still
            n++
        }
    }
    __transport_ship_embark(s.ship, s.company)
    for (var k = 0; k < 3; k++) {
        __test_figure_action_perform(s.ship)
    }
    var far = 0
    for (var j = 0; j < soldiers.length; j++) {
        var t = __figure_get_tile(soldiers[j])
        if (Math.max(Math.abs(t.x - st.x), Math.abs(t.y - st.y)) > 8) {
            far++
        }
    }
    __log_info_native('[test:360] company 14 tiles inland: aboard at once ' + __transport_ship_has_troops(s.ship)
        + ', soldiers still away ' + far + ' of ' + n)
    if (!__transport_ship_has_troops(s.ship) && far == n && n > 0) {
        __log_marker('company_walks_before_boarding')
    }
}

// A transport idling on open water (as after a move), sent on twice.
function t360_second_move() {
    test_reload_city_session('data/default.map')
    var cx = (__scenario_map.width / 2) | 0, cy = (__scenario_map.height / 2) | 0
    for (var wy = cy + 1; wy <= cy + 11; wy++) {
        for (var wx = cx - 10; wx <= cx + 10; wx++) {
            terrain.set_water({ x: wx, y: wy })
        }
    }
    __test_set_scenario_river_points(cx, cy + 6, cx, cy + 7)
    __map_water_cache_river_tiles()
    __map_water_rebuild_shores()
    __test_map_routing_update_water()
    var ship = test_figure_create(FIGURE_TRANSPORT_SHIP, cx, cy + 6)
    __test_figure_set_action(ship, ACTION_215_TRANSPORT_SHIP_EVADING)
    var targets = [{ x: cx - 3, y: cy + 6 }, { x: cx + 3, y: cy + 6 }]
    var reached = []
    for (var m = 0; m < targets.length; m++) {
        __transport_ship_move_to(ship, targets[m].x, targets[m].y)
        for (var i = 0; i < 600; i++) {
            __test_figure_action_perform(ship)
            if (__figure_get_action_state(ship) != ACTION_214_TRANSPORT_SHIP_SAILING) {
                break
            }
        }
        // Idle a moment where it stopped, as a player would before the next order.
        for (var k = 0; k < 20; k++) {
            __test_figure_action_perform(ship)
        }
        var at = __figure_get_tile(ship)
        reached.push(at.x + ',' + at.y)
    }
    __log_info_native('[test:360] moves to ' + JSON.stringify(targets) + ': ship at ' + reached.join(' then '))
    if (reached[0] == targets[0].x + ',' + targets[0].y && reached[1] == targets[1].x + ',' + targets[1].y) {
        __log_marker('second_move_sails')
    }
}

function t360_wharf_animation() {
    test_reload_city_session('data/default.map')
    __scenario_building_allow(BUILDING_TRANSPORT_WHARF, true)
    var wharf = test_shoreline_building_place(BUILDING_TRANSPORT_WHARF, 2)
    if (!wharf) {
        __log_info_native('[test:360] wharf place failed')
        return
    }
    city.get_building(wharf).set_animation('work_n')
    var most = __test_wharf_anim_max_offset(wharf)
    __log_info_native('[test:360] transport wharf work_n reaches image ' + most + ' of SprAmbient 47 (0-23)')
    if (most >= 0 && most <= 23) {
        __log_marker('wharf_worker_stays_in_group')
    }
}

function run_test() {
    t360_aboard()
    t360_walks()
    t360_second_move()
    t360_wharf_animation()
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] troops_survive_aboard')
        && __test_find_inlog('[test-marker] company_walks_before_boarding')
        && __test_find_inlog('[test-marker] second_move_sails')
        && __test_find_inlog('[test-marker] wharf_worker_stays_in_group')
}
