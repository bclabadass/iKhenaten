// A stepped pyramid gets every ramp of its schedule, including the top one of each course that leads onto the next
// step (Brendan, 2026-11-25, Saqqara 6: "the ramp rendering does not move up with the steps of the pyramid").
// The OG rule "no ramp once both the part and the main are cased" means the centre part (subtype 0); ours read the
// main building, the NW corner, cased with the first course, so the medium pyramid (Saqqara's) never got its
// height-6 and height-12 ramps. The small one is built with them on both rules.
// Markers:
//   [test-marker] t932_all_ramps_built
//   [test-marker] t932_save_ramps_needed
//   [test-marker] t932_save_skipped

var T932_TYPES = [
    ['small', BUILDING_SMALL_STEPPED_PYRAMID, [1, 2, 3, 4, 5, 6]],
    ['medium', BUILDING_MEDIUM_STEPPED_PYRAMID, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
]

function t932_parts(bid) {
    var parts = []
    for (var p = bid; p > 0 && parts.length < 200; p = city.get_building(p).next_part_building_id) {
        parts.push(p)
    }
    return parts
}

function t932_heights_built(parts, seen) {
    for (var i = 0; i < parts.length; i++) {
        var f = __test_pyramid_part_state(parts[i]).split(',')
        if (f.length > 6) {
            seen[f[5]] = true
            seen[f[6]] = true
        }
    }
}

function t932_build(name, type, want) {
    test_reload_city_session('data/default.map')
    __test_set_treasury(1000000)
    __scenario_building_allow(type, true)
    var bid = 0, spots = [{ x: 40, y: 40 }, { x: 30, y: 30 }, { x: 60, y: 60 }, { x: 20, y: 50 }]
    for (var i = 0; i < spots.length && !bid; i++) {
        bid = test_building_place(type, spots[i].x, spots[i].y)
    }
    if (!bid) {
        return name + ': not placed'
    }
    __test_monument_set_phase(bid, 2)
    __pyramid_start_block_phase(bid)
    var parts = t932_parts(bid), seen = {}
    for (var step = 0; step < 2000 && __pyramid_remaining_blocks(bid) > 0; step++) {
        if (!__test_pyramid_lay_blocks(bid, 1)) {
            break
        }
        t932_heights_built(parts, seen)
    }
    var missing = []
    for (var k = 0; k < want.length; k++) {
        if (!seen[want[k]]) {
            missing.push(want[k])
        }
    }
    __log_info_native('[test:932] ' + name + ' stepped pyramid: ramp heights never built [' + missing.join(',') + ']')
    return missing.length ? name + ': missing ' + missing.join(',') : ''
}

function t932_save() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Saqqara 11.svx')) {
        __log_marker('t932_save_skipped')
        return
    }
    __test_pump_frames(1)
    var needed = []
    var parts = t932_parts(1)
    for (var i = 0; i < parts.length; i++) {
        var f = __test_pyramid_part_state(parts[i]).split(',')
        if ((f[3] == '27' || f[3] == '13') && __test_pyramid_part_needs_ramp(parts[i])) {
            needed.push(f[3])
        }
    }
    __log_info_native('[test:932] Saqqara 11: course-top parts waiting for their ramp [' + needed.join(',') + ']')
    if (needed.length == 2) {
        __log_marker('t932_save_ramps_needed')
    }
}

function run_test() {
    var bad = []
    for (var i = 0; i < T932_TYPES.length; i++) {
        var r = t932_build(T932_TYPES[i][0], T932_TYPES[i][1], T932_TYPES[i][2])
        if (r) {
            bad.push(r)
        }
    }
    if (bad.length == 0) {
        __log_marker('t932_all_ramps_built')
    } else {
        __log_info_native('[test:932] FAIL ' + bad.join(' | '))
    }
    t932_save()
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t932_all_ramps_built')
        && (__test_find_inlog('[test-marker] t932_save_ramps_needed') || __test_find_inlog('[test-marker] t932_save_skipped'))
}
