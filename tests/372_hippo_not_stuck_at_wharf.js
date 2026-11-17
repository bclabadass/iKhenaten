// A hippo going to water picked any neighbouring water tile, also one under a fishing wharf or ferry landing.
// Buildings block hippos, so it never got there, asked for a new route every tick and stood still for good
// (Brendan's Abdjedu save: a hippo under the ferry landing, target the fishing wharf's water tile).
// Now such tiles are not picked, and a hippo whose route keeps failing chooses something else.

var __test372_ok = false

function test372_fail(msg) {
    __log_info_native('[test:372] ' + msg)
    __test372_ok = false
    __test_signal_ready()
}

function test372_is_building_water(t) {
    return __map_terrain_is(t, TERRAIN_BUILDING) && __map_terrain_is(t, TERRAIN_WATER)
}

function run_test() {
    __log_info_native('[test:372] hippo not stuck at a wharf')
    test_reload_city_session('data/default.map')
    city.figures.remove_figures(FIGURE_HIPPO)
    for (var x = 27; x <= 37; ++x) {
        for (var y = 27; y <= 37; ++y) {
            __test_make_deep_water(x, y)
        }
    }
    // The eight tiles around the hippo are water under a building.
    for (var dx = -1; dx <= 1; ++dx) {
        for (var dy = -1; dy <= 1; ++dy) {
            if (dx || dy) {
                __map_terrain_add({ x: 32 + dx, y: 32 + dy }, TERRAIN_BUILDING)
            }
        }
    }
    __test_map_routing_update_land()
    __test_map_routing_update_water()

    var hippo = test_figure_create(FIGURE_HIPPO, 32, 32)
    if (!hippo) {
        return test372_fail('hippo not created')
    }

    var went = 0
    for (var i = 0; i < 60; ++i) {
        __test_figure_set_action(hippo, 8)
        __test_figure_action_perform(hippo)
        if (__figure_get_action_state(hippo) == 19) {
            went++
            var d = __figure_get_destination_tile(hippo)
            if (test372_is_building_water(d)) {
                return test372_fail('go to water picked the building tile ' + d.x + ',' + d.y)
            }
        }
    }
    if (!went) {
        return test372_fail('the hippo never chose to go to water')
    }

    // One already sent to such a tile (old saves) gives up instead of standing there.
    __test_figure_set_action(hippo, 19)
    __test_figure_set_destination_tile(hippo, 33, 31)
    var freed = -1
    for (var t = 0; t < 200 && freed < 0; ++t) {
        __test_figure_action_perform(hippo)
        var dest = __figure_get_destination_tile(hippo)
        if (__figure_get_action_state(hippo) != 19 || dest.x != 33 || dest.y != 31) {
            freed = t
        }
    }
    __log_info_native('[test:372] went to water ' + went + ' times; stuck hippo freed after ' + freed + ' ticks')
    if (freed < 0) {
        return test372_fail('the hippo kept its blocked destination for 200 ticks')
    }

    __test372_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test372_ok
}
