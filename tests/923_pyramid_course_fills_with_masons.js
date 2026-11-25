// Stonemasons fill a pyramid's course (Brendan, 2026-11-24: "original game had masons that would fill every available
// spot on a given layer"). Each guild kept one mason out and a pyramid took five at most (its worker slots), so in
// Saqqara 8 guilds put 5 masons on a 16-part course. Now the guilds keep sending masons while the course has a part
// no mason works or is on his way to, and stop when every part has one. A part waiting for its ramp is left to the
// carpenter (he skips a part a mason holds; with the whole course taken the Saqqara stalled-pyramid save never got its
// ramp; test 907 covers that save), so no mason is sent for it.
// Markers:
//   [test-marker] t923_course_filled
//   [test-marker] t923_no_extra_masons
//   [test-marker] t923_ramp_part_left_to_carpenter

function t923_place(type, candidates) {
    for (var i = 0; i < candidates.length; i++) {
        var bid = test_building_place(type, candidates[i].x, candidates[i].y)
        if (bid) {
            return bid
        }
    }
    return test_building_place(type, -1, -1)
}

function t923_crew() {
    var out = {}
    __test_pyramid_crew().split(',').forEach(function (kv) {
        var p = kv.split('=')
        out[p[0]] = +p[1]
    })
    return out
}

// A medium stepped pyramid in its block phase with a staffed guild next to it: [pyramid, guild].
function t923_setup() {
    test_reload_city_session('data/default.map')
    __scenario_building_allow(BUILDING_MEDIUM_STEPPED_PYRAMID, true)
    __scenario_building_allow(BUILDING_STONEMASONS_GUILD, true)
    __test_set_treasury(1000000)
    var cx = (__scenario_map.width / 2) | 0
    var cy = (__scenario_map.height / 2) | 0
    var mon = t923_place(BUILDING_MEDIUM_STEPPED_PYRAMID,
        [{ x: cx - 6, y: cy - 6 }, { x: cx, y: cy }, { x: 40, y: 40 }, { x: 30, y: 30 }])
    __test_monument_set_phase(mon, 2)
    __pyramid_start_block_phase(mon)
    var guild = t923_place(BUILDING_STONEMASONS_GUILD, [])
    __test_building_set_workers(guild, 12)
    return [mon, guild]
}

function run_test() {
    var setup = t923_setup()
    var mon = setup[0], guild = setup[1]
    var open = t923_crew().open
    for (var i = 0; i < open + 4; i++) {
        __test_building_spawn_figure(guild)
    }
    var sent = __test_count_figures(FIGURE_STONEMASON)
    for (var k = 0; k < 10; k++) {
        __test_building_spawn_figure(guild)
    }
    var after = __test_count_figures(FIGURE_STONEMASON)
    __log_info_native('[test:923] pyramid ' + mon + ' guild ' + guild + ': ' + open + ' free parts on the course, '
        + sent + ' masons sent, ' + after + ' after ten more spawns')
    if (mon && guild && open > 5 && sent == open) {
        __log_marker('t923_course_filled')
    }
    if (mon && guild && after == sent) {
        __log_marker('t923_no_extra_masons')
    }

    setup = t923_setup()
    mon = setup[0]
    guild = setup[1]
    var ramp_part = __test_pyramid_boost_until_ramp(mon)
    __test_pyramid_level_layer(ramp_part)
    var crew = t923_crew()
    for (var j = 0; j < crew.open + 4; j++) {
        __test_building_spawn_figure(guild)
    }
    var ramp_sent = __test_count_figures(FIGURE_STONEMASON)
    __log_info_native('[test:923] part ' + ramp_part + ' waits for its ramp (' + __test_pyramid_part_needs_ramp(ramp_part)
        + '): ' + crew.open + ' free parts, ' + crew.ramp + ' waiting for a ramp, ' + ramp_sent + ' masons sent')
    if (ramp_part && crew.ramp > 0 && ramp_sent == crew.open - crew.ramp) {
        __log_marker('t923_ramp_part_left_to_carpenter')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t923_course_filled') && __test_find_inlog('[test-marker] t923_no_extra_masons')
        && __test_find_inlog('[test-marker] t923_ramp_part_left_to_carpenter')
}
