// A save with spare fishing boats at a shipwright loads without them. Before the shipwright fix, shipwrights built
// fishing boats no wharf needed; each waited at its shipwright for good (Abdjedu 11 on the Duo: one beside the
// shipwright, every fishing wharf already with a boat). On load, new boats still waiting keep only as many as there
// are fishing wharves without a boat (the first ones built); the rest are removed. Boats already at work stay.
// Markers:
//   [test-marker] spare_boats_removed_on_load

var T350_SAVE = 'test_350_spare_boats.svx'

function t350_waiting() {
    var out = []
    for (var f = 1; f < 3000; f++) {
        if (__figure_is_valid(f) && __figure_get_type(f) == FIGURE_FISHING_BOAT && __test_figure_is_alive(f)
            && __figure_get_action_state(f) == 0) {
            out.push(f)
        }
    }
    return out
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_SHIPWRIGHT, true)
    var yard = test_shoreline_building_place(BUILDING_SHIPWRIGHT, 3)
    var wharf = __test_building_create(BUILDING_FISHING_WHARF, 20, 20)
    if (!yard || !wharf) {
        __log_info_native('[test:350] place failed: shipwright ' + yard + ' wharf ' + wharf)
        __test_signal_ready()
        return
    }
    // One fishing wharf without a boat and three new boats waiting at the shipwright.
    var yt = __building_tile(yard)
    for (var i = 0; i < 3; i++) {
        var boat = test_figure_create(FIGURE_FISHING_BOAT, yt.x + i, yt.y + 3)
        __test_figure_set_home(boat, yard)
        __test_figure_set_action(boat, 0)
        if (i == 0) {
            __test_building_set_figure_slot(yard, BUILDING_SLOT_BOAT, boat)
        }
    }
    var before = t350_waiting()

    if (!__game_write_savegame(T350_SAVE) || !__game_load_savegame(T350_SAVE)) {
        __log_info_native('[test:350] save/load failed')
        __game_delete_savegame(T350_SAVE)
        __test_signal_ready()
        return
    }
    __game_delete_savegame(T350_SAVE)
    var after = t350_waiting()
    __log_info_native('[test:350] new boats waiting, one free wharf: before save ' + JSON.stringify(before)
        + ', after load ' + JSON.stringify(after))
    if (before.length == 3 && after.length == 1 && after[0] == before[0]) {
        __log_marker('spare_boats_removed_on_load')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] spare_boats_removed_on_load')
}
