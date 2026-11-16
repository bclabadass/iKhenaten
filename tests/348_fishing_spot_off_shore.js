// Fishing boats don't sink at a fishing spot near the shore. After every flood the spots move to random deep water;
// in Abdjedu one landed two tiles from land (Brendan on the Duo, Abdjedu 8: the jumping fish swam onto the coast and
// all the fishing boats sank). The jumping fish wanders up to 4 tiles from its spot, and a boat finding the spot's
// tile taken (by the fish) moves to the first free water beside it, which there was a shore tile. Boats can't sail
// tiles touching land, so the boat couldn't reach it, took a point of damage, and tried again until it sank at 20.
// Now a boat only moves to water it can sail, and the re-rolled spots keep 4 tiles of open water around them.
// Markers:
//   [test-marker] boat_takes_sailable_water
//   [test-marker] fishing_spots_in_open_water

var T348_LAKE = { x: 20, y: 20, size: 25 }

function t348_open(p, r) {
    for (var dy = -r; dy <= r; dy++) {
        for (var dx = -r; dx <= r; dx++) {
            var t = { x: p.x + dx, y: p.y + dy }
            if (!__map_terrain_is(t, TERRAIN_WATER) || __map_terrain_is(t, TERRAIN_FLOODPLAIN)) {
                return false
            }
        }
    }
    return true
}

// Open water a boat can sail whose first neighbour in the boat's search order (top-left) is water it can't.
function t348_spot_by_shore() {
    for (var y = T348_LAKE.y; y < T348_LAKE.y + T348_LAKE.size; y++) {
        for (var x = T348_LAKE.x; x < T348_LAKE.x + T348_LAKE.size; x++) {
            if (__test_boat_routing_value(x, y) != 0) {
                continue
            }
            var n = { x: x - 1, y: y - 1 }
            if (__map_terrain_is(n, TERRAIN_WATER) && __test_boat_routing_value(n.x, n.y) != 0) {
                return { x: x, y: y }
            }
        }
    }
    return null
}

function run_test() {
    test_reload_city_session('data/default.map')
    // A lake of deep water on the test map's dry land, with a shore all round.
    for (var ly = T348_LAKE.y; ly < T348_LAKE.y + T348_LAKE.size; ly++) {
        for (var lx = T348_LAKE.x; lx < T348_LAKE.x + T348_LAKE.size; lx++) {
            __test_make_deep_water(lx, ly)
        }
    }
    __map_water_cache_river_tiles()
    __test_map_routing_update_water()

    var spot = t348_spot_by_shore()
    if (!spot) {
        __log_info_native('[test:348] no sailable water beside a shore tile on the map')
    } else {
        var fish = test_figure_create(FIGURE_FISHING_POINT, spot.x, spot.y)
        var boat = test_figure_create(FIGURE_FISHING_BOAT, spot.x, spot.y)
        var alt = __test_fishing_boat_alternative_tile(boat)
        var at = alt < 0 ? null : { x: Math.floor(alt / 1000), y: alt % 1000 }
        var value = at ? __test_boat_routing_value(at.x, at.y) : 'none'
        __log_info_native('[test:348] boat at ' + spot.x + ',' + spot.y + ' (fish ' + fish + ' on its tile) moves to '
            + (at ? at.x + ',' + at.y : 'nowhere') + ', boat routing there ' + value)
        if (at && value == 0) {
            __log_marker('boat_takes_sailable_water')
        }
        city.figures.remove_figures(FIGURE_FISHING_BOAT)
    }

    var bad = [], total = 0
    for (var round = 0; round < 25; round++) {
        __test_fishing_points_reset()
        for (var i = 0; i < 20; i++) {
            var v = __test_scenario_fishing_point(i)
            if (v < 0) {
                continue
            }
            total++
            var p = { x: Math.floor(v / 1000), y: v % 1000 }
            if (!t348_open(p, 4)) {
                bad.push(p.x + ',' + p.y)
            }
        }
    }
    __log_info_native('[test:348] re-rolled fishing spots: ' + total + ', within 4 tiles of land or floodplain: '
        + bad.length + ' ' + bad.slice(0, 8).join(' '))
    if (total > 0 && bad.length == 0) {
        __log_marker('fishing_spots_in_open_water')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] boat_takes_sailable_water')
        && __test_find_inlog('[test-marker] fishing_spots_in_open_water')
}
