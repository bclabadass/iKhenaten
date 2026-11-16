// Storage yards send papyrus in whole loads (100 units): it went to a scribal school short by any amount, 10 at a
// time as it used it up, and left odd amounts in yard spaces (Men-nefer: 390 papyrus). (The monument sled part of
// this test went with upstream's sled trains, which replaced the storage yard's monument deliveries.)
// Markers:
//   [test-marker] papyrus_waits_for_room_for_a_load
//   [test-marker] papyrus_sends_whole_loads

function t318_papyrus() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)

    var school = test_building_place(BUILDING_SCRIBAL_SCHOOL, -1, -1)
    if (!school) {
        __log_info_native('[test:318] scribal school placement failed')
        return
    }
    var st = __building_tile(school)
    for (var x = st.x - 1; x <= st.x + 6; x++) {
        terrain.add({ x: x, y: st.y + 2 }, TERRAIN_ROAD)
    }
    var yard = __test_building_create(BUILDING_STORAGE_YARD, st.x + 3, st.y + 3)
    __test_update_road_network()
    __test_check_kingdome_access()
    __test_building_set_workers(school, 10)
    // The test road doesn't reach the map entry; the asker search skips buildings at distance 0.
    __test_building_set_distance_from_entry(school, 10)
    __test_building_set_distance_from_entry(yard, 10)
    __test_storage_yard_add_resource(yard, RESOURCE_PAPYRUS, 400)
    // The yard only serves schools counted active, which the day's building count does.
    __test_update_building_counters()

    var b = city.get_building(school)
    var cap = __test_building_need_resource_amount(school, RESOURCE_PAPYRUS)
    b.consume_resource(RESOURCE_PAPYRUS, -(cap - 10))
    var short_10 = __test_storageyard_papyrus_task_amount(yard)
    b.consume_resource(RESOURCE_PAPYRUS, cap - 10 - (cap - 150))
    var short_150 = __test_storageyard_papyrus_task_amount(yard)
    __log_info_native('[test:318] school ' + school + ' yard ' + yard + ' capacity ' + cap
        + ' short by 10 -> ' + short_10 + ', short by 150 -> ' + short_150)
    if (cap > 150 && short_10 == 0 && short_150 > 0) {
        __log_marker('papyrus_waits_for_room_for_a_load')
    }
    if (short_150 == 100) {
        __log_marker('papyrus_sends_whole_loads')
    }
}

function run_test() {
    t318_papyrus()
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] papyrus_waits_for_room_for_a_load')
        && __test_find_inlog('[test-marker] papyrus_sends_whole_loads')
}
