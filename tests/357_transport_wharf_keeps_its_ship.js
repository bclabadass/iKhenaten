// A transport wharf whose ship is away doesn't order another (Abdjedu on the Duo: with its transport docked a tile
// off the berth, the wharf kept ordering ships; the shipwright built each one, using up timber, and the new ship had
// no wharf and was wrecked as it was launched). The ship gives up the wharf's slot whenever it is off the berth
// tile, and the wharf added a request every month while the slot was empty and kept it. Now:
// - the wharf counts a live transport ship of its own as its ship, wherever it is;
// - the request is recounted each day (OG shipwright_boat_needed), so it doesn't pile up;
// - a shipwright drops a transport order no wharf still needs, rather than spend more timber on it;
// - the berth is worked out on load (it isn't saved), so a docked ship keeps its slot after loading.
// Markers:
//   [test-marker] ship_away_no_request
//   [test-marker] request_does_not_pile_up
//   [test-marker] unneeded_transport_order_dropped
//   [test-marker] berth_known_after_load

var T357_SAVE = 'test_357_transport_wharf.svx'

function t357_staff(bid) {
    __test_building_set_workers(bid, 20)
    __test_building_force_road_access(bid)
    __test_building_set_open_water_access(bid, 1)
}

// A month's building counts and the wharf's month update.
function t357_month(wharf) {
    for (var d = 0; d < 3; d++) {
        __test_update_building_counters()
    }
    __test_transport_wharf_update_month(wharf)
    __test_update_building_counters()
}

function t357_setup() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_TRANSPORT_WHARF, true)
    __scenario_building_allow(BUILDING_SHIPWRIGHT, true)
    var wharf = test_shoreline_building_place(BUILDING_TRANSPORT_WHARF, 2)
    if (!wharf) {
        return null
    }
    t357_staff(wharf)
    var cx = (__scenario_map.width / 2) | 0, cy = (__scenario_map.height / 2) | 0
    for (var wy = cy + 1; wy <= cy + 9; wy++) {
        for (var wx = cx - 8; wx <= cx + 8; wx++) {
            terrain.set_water({ x: wx, y: wy })
        }
    }
    __test_set_scenario_river_points(cx, cy + 5, cx, cy + 6)
    __map_water_cache_river_tiles()
    __map_water_rebuild_shores()
    __test_map_routing_update_water()
    __test_transport_wharf_update_month(wharf)
    var access = __test_wharf_water_access(wharf)
    if (access < 0) {
        return null
    }
    __test_transport_ships_requested_set(0)
    return { wharf: wharf, berth: { x: Math.floor(access / 1000), y: access % 1000 }, cx: cx, cy: cy }
}

// A shipwright part way through a transport with no transport wharf wanting one.
function t357_shipwright() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_SHIPWRIGHT, true)
    var yard = test_shoreline_building_place(BUILDING_SHIPWRIGHT, 3)
    if (yard) {
        t357_staff(yard)
        city.get_building(yard).consume_resource(RESOURCE_TIMBER, -300)
        __test_shipyard_set_order(yard, FIGURE_TRANSPORT_SHIP, 120)
        var timber = city.get_building(yard).stored_resource(RESOURCE_TIMBER)
        for (var d = 0; d < 5; d++) {
            __test_building_update_day(yard)
        }
        var order = __shipyard_get_property(yard, 'process_type')
        var spent = timber - city.get_building(yard).stored_resource(RESOURCE_TIMBER)
        __log_info_native('[test:357] transport order with every wharf served: order now ' + order + ', timber spent '
            + spent + ' of ' + timber)
        if (order == 0 && spent == 0) {
            __log_marker('unneeded_transport_order_dropped')
        }
    } else {
        __log_info_native('[test:357] shipwright place failed')
    }
}

function run_test() {
    t357_shipwright()
    var s = t357_setup()
    if (!s) {
        __log_info_native('[test:357] setup failed')
        __test_signal_ready()
        return
    }

    var seen = []
    for (var m = 0; m < 3; m++) {
        t357_month(s.wharf)
        seen.push(__test_transport_ships_requested())
    }
    __log_info_native('[test:357] wharf without a ship, requests after each month: ' + seen.join(','))
    if (seen.join(',') == '1,1,1') {
        __log_marker('request_does_not_pile_up')
    }

    // Its ship holds two tiles off the berth: the slot is empty, the ship is still the wharf's.
    var ship = test_figure_create(FIGURE_TRANSPORT_SHIP, s.berth.x, s.berth.y + 2)
    __test_figure_set_home(ship, s.wharf)
    __test_building_set_figure_slot(s.wharf, BUILDING_SLOT_BOAT, 0)
    __test_transport_ships_requested_set(0)
    var away = []
    for (var m = 0; m < 3; m++) {
        t357_month(s.wharf)
        away.push(__test_transport_ships_requested())
    }
    __log_info_native('[test:357] ship ' + ship + ' away from the berth, requests after each month: ' + away.join(','))
    if (away.join(',') == '0,0,0') {
        __log_marker('ship_away_no_request')
    }

    if (!__game_write_savegame(T357_SAVE)) {
        __log_info_native('[test:357] save failed')
    } else if (!__game_load_savegame(T357_SAVE)) {
        __log_info_native('[test:357] load failed')
    } else {
        __test_pump_frames(2)
        var after = __test_wharf_water_access(s.wharf)
        __log_info_native('[test:357] berth after load ' + after + ' (was ' + (s.berth.x * 1000 + s.berth.y) + ')')
        if (after == s.berth.x * 1000 + s.berth.y) {
            __log_marker('berth_known_after_load')
        }
    }
    __game_delete_savegame(T357_SAVE)
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] request_does_not_pile_up')
        && __test_find_inlog('[test-marker] ship_away_no_request')
        && __test_find_inlog('[test-marker] unneeded_transport_order_dropped')
        && __test_find_inlog('[test-marker] berth_known_after_load')
}
