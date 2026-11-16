// Laying out a monument is free, as in the original (its model data has no cost), and still counts as placed.
// build_planner::place() treated a total cost of 0 as "nothing placed", so a new mastaba logged "place() FAILED"
// and the planner skipped what follows a placement: the land routing update (walkers kept routing through the
// mastaba's tiles as clear land until something else refreshed it), the empty-land tile refresh, the undo record. Undo stays off for
// monuments: it removes their parts but leaves the tiles marked as building.
// Markers:
//   [test-marker] mastaba_in_land_routing
//   [test-marker] mastaba_not_undone

function t346_count() {
    var n = 0
    for (var id = 1; id < 4000; id++) {
        if (__building_is_valid(id)) {
            n++
        }
    }
    return n
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_MEDIUM_MASTABA, true)
    __test_map_routing_update_land()
    var inside = { x: 62, y: 66 }
    var before = __test_routing_citizen_value(inside.x, inside.y)

    test_planner_enter_build_mode(BUILDING_MEDIUM_MASTABA)
    city_planner.update(60, 60)
    city_planner.construction_start(60, 60)
    city_planner.construction_update(60, 60)
    city_planner.construction_finalize()
    test_planner_exit_build_mode()
    var parts = t346_count()
    var after = __test_routing_citizen_value(inside.x, inside.y)
    __log_info_native('[test:346] ' + parts + ' parts; land routing at ' + inside.x + ',' + inside.y + ' before ' + before
        + ', after ' + after + '; treasury ' + city.finance.treasury)
    if (parts > 0 && before == 4 && after != 4) {
        __log_marker('mastaba_in_land_routing')
    }

    __ui_game_undo_perform()
    __test_pump_frames(2)
    var left = t346_count()
    __log_info_native('[test:346] after Undo: ' + left + ' buildings')
    if (left == parts) {
        __log_marker('mastaba_not_undone')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] mastaba_in_land_routing')
        && __test_find_inlog('[test-marker] mastaba_not_undone')
}
