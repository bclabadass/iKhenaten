// A mortuary gets its linen from the storage yards, like the senet house its beer. Nothing delivered linen to a
// mortuary: carts only take raw materials to workshops, and the mortuary isn't one, so it stood idle in a city
// full of linen (Timna 11 on the Duo). A staffed storage yard now sends linen in whole loads to a mortuary with
// room for it, and its cart unloads there. The city's count of mortuaries also left them out (the mortuary's
// update_count only added its workers to health), so after the daily recount or a load there were none to supply,
// and the Health overseer listed 0 mortuaries.
// Markers:
//   [test-marker] mortuaries_counted
//   [test-marker] yard_sends_linen_to_mortuary
//   [test-marker] mortuary_receives_linen

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)

    var mortuary = test_building_place(BUILDING_MORTUARY, -1, -1)
    if (!mortuary) {
        __log_info_native('[test:338] mortuary placement failed')
        __test_signal_ready()
        return
    }
    var st = __building_tile(mortuary)
    for (var x = st.x - 1; x <= st.x + 6; x++) {
        terrain.add({ x: x, y: st.y + 2 }, TERRAIN_ROAD)
    }
    var yard = __test_building_create(BUILDING_STORAGE_YARD, st.x + 3, st.y + 3)
    __test_update_road_network()
    __test_check_kingdome_access()
    __test_building_set_workers(mortuary, 8)
    __test_building_set_workers(yard, 10)
    // The test road doesn't reach the map entry; the asker search skips buildings at distance 0.
    __test_building_set_distance_from_entry(mortuary, 10)
    __test_building_set_distance_from_entry(yard, 10)
    var added = __test_storage_yard_add_resource(yard, RESOURCE_LINEN, 400)

    // The daily recount (also run on load): placing a building counts it, a recount must keep it.
    __test_update_building_counters()
    var counted = city.count_total_buildings(BUILDING_MORTUARY)
    var active = city.count_active_buildings(BUILDING_MORTUARY)
    __log_info_native('[test:338] after the recount: ' + counted + ' mortuaries, ' + active + ' active')
    if (counted == 1 && active == 1) {
        __log_marker('mortuaries_counted')
    }

    var b = city.get_building(mortuary)
    __test_calculate_storageyard_stocks()
    var in_yard = __test_yards_stored(RESOURCE_LINEN)
    var most = 0
    for (var day = 0; day < 12 && most <= 0; day++) {
        __test_buildings_generate_figures()
        for (var tick = 0; tick < 60; tick++) {
            __test_figures_update()
            most = Math.max(most, b.stored_resource(RESOURCE_LINEN))
        }
    }
    __test_calculate_storageyard_stocks()
    var left = __test_yards_stored(RESOURCE_LINEN)
    __log_info_native('[test:338] mortuary ' + mortuary + ' yard ' + yard + ' (stocked ' + added + '): yard linen ' + in_yard + ' -> ' + left
        + ', mortuary linen up to ' + most)

    if (left < in_yard) {
        __log_marker('yard_sends_linen_to_mortuary')
    }
    if (most >= 100) {
        __log_marker('mortuary_receives_linen')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] mortuaries_counted')
        && __test_find_inlog('[test-marker] yard_sends_linen_to_mortuary')
        && __test_find_inlog('[test-marker] mortuary_receives_linen')
}
