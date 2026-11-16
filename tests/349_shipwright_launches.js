// A shipwright keeps launching the ships it is asked for. Abdjedu 11 on the Duo: a shipwright stuck at 1200% and
// rising, a fishing boat idle beside it for good, and no transport ship launched. Three causes:
// - Fishing wharves without a boat asked for one on every building count, and nothing cleared the count, so it
//   kept growing and the shipwright built fishing boats no wharf needed. The count is now the wharves without a boat.
// - A finished fishing boat with no wharf to go to waited at the shipwright for good, and the shipwright launched
//   nothing else while a fishing boat sat in its boat slot. Now the shipwright drops a fishing boat that no wharf
//   still needs, and a waiting fishing boat only holds back the next fishing boat.
// - A transport ship docks at its wharf's water access point, but counted itself docked only on the first water
//   tile beside the wharf, often another tile: it left the wharf's boat slot, and the wharf ordered more ships.
// Markers:
//   [test-marker] fishing_requests_count_wharves
//   [test-marker] unneeded_fishing_boat_dropped
//   [test-marker] transport_launches_past_waiting_boat
//   [test-marker] docked_transport_keeps_wharf

function t349_count(type) {
    var n = 0
    for (var f = 1; f < 2000; f++) {
        if (__figure_is_valid(f) && __figure_get_type(f) == type) {
            n++
        }
    }
    return n
}

function t349_staff(bid) {
    __test_building_set_workers(bid, 20)
    __test_building_force_road_access(bid)
    __test_building_set_open_water_access(bid, 1)
}

function t349_water_beside(bid) {
    var bt = __building_tile(bid)
    for (var dy = -2; dy <= 5; dy++) {
        for (var dx = -2; dx <= 5; dx++) {
            var t = { x: bt.x + dx, y: bt.y + dy }
            if (terrain.is(t, TERRAIN_WATER) && !terrain.is(t, TERRAIN_BUILDING)) {
                return t
            }
        }
    }
    return null
}

function t349_requests() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_FISHING_WHARF, true)
    var wharf = test_shoreline_building_place(BUILDING_FISHING_WHARF, 2)
    if (!wharf) {
        __log_info_native('[test:349] fishing wharf place failed')
        return
    }
    t349_staff(wharf)
    __test_building_set_figure_slot(wharf, BUILDING_SLOT_BOAT, 0)
    var seen = []
    for (var i = 0; i < 5; i++) {
        __test_update_building_counters()
        seen.push(__test_fishing_boats_requested())
    }
    __log_info_native('[test:349] one wharf without a boat, fishing boats requested after each count: ' + seen.join(','))
    if (seen.join(',') == '1,1,1,1,1') {
        __log_marker('fishing_requests_count_wharves')
    }
}

function t349_shipwright() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_SHIPWRIGHT, true)
    var yard = test_shoreline_building_place(BUILDING_SHIPWRIGHT, 3)
    var water = yard ? t349_water_beside(yard) : null
    if (!water) {
        __log_info_native('[test:349] shipwright place failed')
        return
    }
    t349_staff(yard)
    var yt = __building_tile(yard)
    for (var rx = -1; rx <= 3; rx++) {
        terrain.add({ x: yt.x + rx, y: yt.y - 1 }, TERRAIN_ROAD)
    }

    // A spare fishing boat waiting by the shipwright (no fishing wharf on the map), as in Abdjedu 11.
    var spare = test_figure_create(FIGURE_FISHING_BOAT, water.x, water.y)
    __test_figure_set_home(spare, yard)
    __test_building_set_figure_slot(yard, BUILDING_SLOT_BOAT, spare)
    __test_figure_set_action(spare, 0)

    __test_shipyard_set_order(yard, FIGURE_FISHING_BOAT, 5280)
    var boats = t349_count(FIGURE_FISHING_BOAT)
    __test_building_spawn_figure(yard)
    var order = __shipyard_get_property(yard, 'process_type')
    __log_info_native('[test:349] finished fishing boat, no wharf needs one: order now ' + order + ', progress '
        + __shipyard_get_property(yard, 'progress') + ', fishing boats ' + boats + ' -> ' + t349_count(FIGURE_FISHING_BOAT))
    if (order == 0 && t349_count(FIGURE_FISHING_BOAT) == boats) {
        __log_marker('unneeded_fishing_boat_dropped')
    }

    __test_shipyard_set_order(yard, FIGURE_TRANSPORT_SHIP, 400)
    __test_building_spawn_figure(yard)
    var ships = t349_count(FIGURE_TRANSPORT_SHIP)
    __log_info_native('[test:349] finished transport ship with the fishing boat still waiting: transport ships ' + ships
        + ', order now ' + __shipyard_get_property(yard, 'process_type'))
    if (ships == 1) {
        __log_marker('transport_launches_past_waiting_boat')
    }
}

function t349_dock() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_TRANSPORT_WHARF, true)
    var wharf = test_shoreline_building_place(BUILDING_TRANSPORT_WHARF, 2)
    if (!wharf) {
        __log_info_native('[test:349] transport wharf place failed')
        return
    }
    t349_staff(wharf)
    // Open water a boat can reach below the wharf (the placement patch is two rows, all of it shore).
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
        __log_info_native('[test:349] transport wharf has no water access point')
        return
    }
    var berth = { x: Math.floor(access / 1000), y: access % 1000 }
    var ship = test_figure_create(FIGURE_TRANSPORT_SHIP, berth.x, berth.y)
    __test_figure_set_home(ship, wharf)
    __test_figure_set_destination_tile(ship, berth.x, berth.y)
    __test_figure_set_action(ship, ACTION_213_TRANSPORT_SHIP_DOCKED)
    __test_building_set_figure_slot(wharf, BUILDING_SLOT_BOAT, ship)
    for (var i = 0; i < 5; i++) {
        __test_figure_action_perform(ship)
    }
    var slot = __test_building_figure_id(wharf, BUILDING_SLOT_BOAT)
    var at = __figure_get_tile(ship)
    __test_transport_ships_requested_set(0)
    __test_transport_wharf_update_month(wharf)
    var requested = __test_transport_ships_requested()
    __log_info_native('[test:349] transport ship docked at the access point ' + berth.x + ',' + berth.y + ' (at '
        + at.x + ',' + at.y + '): wharf boat slot ' + slot + ' (ship ' + ship + '), ships requested ' + requested)
    if (slot == ship && requested == 0) {
        __log_marker('docked_transport_keeps_wharf')
    }
}

function run_test() {
    t349_requests()
    t349_shipwright()
    t349_dock()
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] fishing_requests_count_wharves')
        && __test_find_inlog('[test-marker] unneeded_fishing_boat_dropped')
        && __test_find_inlog('[test-marker] transport_launches_past_waiting_boat')
        && __test_find_inlog('[test-marker] docked_transport_keeps_wharf')
}
