// A rotated mastaba is built on the tiles its preview showed and the placement check tested. The planner previews
// and checks the footprint for the camera's orientation, but each rotation lays the parts out from a different
// corner of the main part, so a rotated mastaba landed up to 12 tiles away from the preview, over ground nobody
// checked (Abdjedu 7 on the Duo: a medium mastaba off the tap and over a rock outcrop). The main part now moves so
// the parts cover the checked box in every rotation.
// Markers:
//   [test-marker] mastaba_rotations_on_preview
//   [test-marker] rotated_mastaba_clear_of_rock

var T345_TYPES = [
    { name: 'small', type: BUILDING_SMALL_MASTABA, parts: [BUILDING_SMALL_MASTABA, BUILDING_SMALL_MASTABA_SIDE, BUILDING_SMALL_MASTABA_WALL, BUILDING_SMALL_MASTABA_ENTRANCE] },
    { name: 'medium', type: BUILDING_MEDIUM_MASTABA, parts: [BUILDING_MEDIUM_MASTABA, BUILDING_MEDIUM_MASTABA_SIDE, BUILDING_MEDIUM_MASTABA_WALL, BUILDING_MEDIUM_MASTABA_ENTRANCE] },
    { name: 'large', type: BUILDING_LARGE_MASTABA, parts: [BUILDING_LARGE_MASTABA, BUILDING_LARGE_MASTABA_SIDE, BUILDING_LARGE_MASTABA_WALL, BUILDING_LARGE_MASTABA_ENTRANCE] }
]
var T345_TILE = { x: 60, y: 60 }

function t345_box(parts) {
    var minx = 999, miny = 999, maxx = -1, maxy = -1, n = 0
    for (var id = 1; id < 4000; id++) {
        if (!__building_is_valid(id) || parts.indexOf(__building_type(id)) < 0) {
            continue
        }
        var t = __building_tile(id)
        n++
        minx = Math.min(minx, t.x); miny = Math.min(miny, t.y); maxx = Math.max(maxx, t.x + 1); maxy = Math.max(maxy, t.y + 1)
    }
    return n ? minx + ',' + miny + '..' + maxx + ',' + maxy : 'none'
}

// Place `m` at the test tile with the camera turned `camera` times and the building turned `rotation` times.
function t345_place(m, camera, rotation, rock) {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(m.type, true)
    for (var c = 0; c < camera; c++) {
        __camera_rotate_right()
    }
    __test_pump_frames(1)
    if (rock) {
        terrain.add(rock, TERRAIN_ROCK)
    }
    test_planner_enter_build_mode(m.type)
    for (var r = 0; r < rotation; r++) {
        emit event_rotate_building{ value: 1 }
        __test_process_events()
    }
    city_planner.update(T345_TILE.x, T345_TILE.y)
    var can = city_planner.can_be_placed()
    city_planner.construction_start(T345_TILE.x, T345_TILE.y)
    city_planner.construction_update(T345_TILE.x, T345_TILE.y)
    city_planner.construction_finalize()
    test_planner_exit_build_mode()
    return { can: can, box: t345_box(m.parts) }
}

function run_test() {
    var wrong = []
    for (var i = 0; i < T345_TYPES.length; i++) {
        var m = T345_TYPES[i]
        for (var camera = 0; camera < 4; camera++) {
            var checked = t345_place(m, camera, 0).box
            for (var rotation = 1; rotation < 4; rotation++) {
                var got = t345_place(m, camera, rotation).box
                if (got != checked) {
                    wrong.push(m.name + ' camera ' + camera + ' rotation ' + rotation + ': ' + got + ' not ' + checked)
                }
            }
        }
    }
    __log_info_native('[test:345] rotated footprints off the checked box: ' + wrong.length + ' ' + wrong.slice(0, 6).join('; '))
    if (wrong.length == 0) {
        __log_marker('mastaba_rotations_on_preview')
    }

    // Rock just outside the checked footprint, where a medium mastaba turned once used to land (camera north: the
    // preview covers 60..65 x 60..73, the old placement 56..61): it must be built on the preview, clear of the rock.
    var medium = T345_TYPES[1]
    var rock = { x: 56, y: 65 }
    var r = t345_place(medium, 0, 1, rock)
    var on_rock = 0
    for (var id = 1; id < 4000; id++) {
        if (!__building_is_valid(id) || medium.parts.indexOf(__building_type(id)) < 0) {
            continue
        }
        var t = __building_tile(id)
        for (var dy = 0; dy < 2; dy++) {
            for (var dx = 0; dx < 2; dx++) {
                if (__map_terrain_is({ x: t.x + dx, y: t.y + dy }, TERRAIN_ROCK)) {
                    on_rock++
                }
            }
        }
    }
    __log_info_native('[test:345] medium turned once with rock at 56,65: can_be_placed ' + r.can + ', placed ' + r.box
        + ', part tiles on rock ' + on_rock)
    if (r.can == CAN_PLACE && r.box != 'none' && on_rock == 0) {
        __log_marker('rotated_mastaba_clear_of_rock')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] mastaba_rotations_on_preview')
        && __test_find_inlog('[test-marker] rotated_mastaba_clear_of_rock')
}
